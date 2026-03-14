import { prisma } from "@/prisma/client";
import { invalidateCache, cacheKeys } from "@/lib/cache";

/**
 * Generate unique receipt number
 * Format: RCP-YYYY-MMDD-HHMMSS-XXXX
 */
export async function generateReceiptNumber(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  const todayStart = new Date(year, now.getMonth(), now.getDate());
  const todayEnd = new Date(year, now.getMonth(), now.getDate() + 1);

  const todayReceipts = await prisma.receipt.count({
    where: {
      createdAt: {
        gte: todayStart,
        lt: todayEnd,
      },
    },
  });

  const sequence = String(todayReceipts + 1).padStart(4, "0");
  return `RCP-${year}-${month}${day}-${hours}${minutes}${seconds}-${sequence}`;
}

/**
 * Create a new receipt
 */
export async function createReceipt(data: { supplierName: string; warehouseId: string }, userId: string) {
  const receiptNumber = await generateReceiptNumber();

  return prisma.receipt.create({
    data: {
      receiptNumber,
      supplierName: data.supplierName,
      warehouseId: data.warehouseId,
      userId,
      status: "draft",
    },
    include: {
      warehouse: true,
    },
  });
}

/**
 * Add items to a receipt
 */
export async function addReceiptItems(receiptId: string, items: { productId: string; quantityReceived: number }[]) {
  const receipt = await prisma.receipt.findUnique({
    where: { id: receiptId },
  });

  if (!receipt) throw new Error("Receipt not found");
  if (receipt.status !== "draft") throw new Error("Cannot add items to a validated receipt");

  return prisma.receiptItem.createMany({
    data: items.map((item) => ({
      receiptId,
      productId: item.productId,
      quantityReceived: item.quantityReceived,
    })),
  });
}

/**
 * Validate a receipt
 * Increases stock and creates stock movement records
 */
export async function validateReceipt(receiptId: string, userId: string) {
  const receipt = await prisma.receipt.findUnique({
    where: { id: receiptId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      warehouse: true,
    },
  });

  if (!receipt) throw new Error("Receipt not found");
  if (receipt.status === "validated") throw new Error("Receipt is already validated");
  if (receipt.items.length === 0) throw new Error("Cannot validate a receipt with no items");

  // Start transaction
  return prisma.$transaction(async (tx) => {
    for (const item of receipt.items) {
      // 1. Update Product total quantity
      await tx.product.update({
        where: { id: item.productId },
        data: {
          quantity: { increment: item.quantityReceived },
        },
      });

      // 2. Update/Create Stock in specific warehouse
      await tx.stock.upsert({
        where: {
          productId_warehouseId: {
            productId: item.productId,
            warehouseId: receipt.warehouseId,
          },
        },
        create: {
          productId: item.productId,
          warehouseId: receipt.warehouseId,
          quantity: item.quantityReceived,
          userId,
        },
        update: {
          quantity: { increment: item.quantityReceived },
        },
      });

      // 3. Create StockMovement record
      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          movementType: "INCOMING",
          quantity: item.quantityReceived,
          source: receipt.supplierName,
          destination: receipt.warehouse.name,
          referenceDocument: receipt.receiptNumber,
          userId,
        },
      });
    }

    // 4. Update Receipt status
    const updatedReceipt = await tx.receipt.update({
      where: { id: receiptId },
      data: {
        status: "validated",
        validatedAt: new Date(),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        warehouse: true,
      },
    });

    // Invalidate product cache
    await invalidateCache(cacheKeys.products.pattern).catch(() => {});

    return updatedReceipt;
  });
}
