import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { prisma } from "@/prisma/client";
import { logger } from "@/lib/logger";
import { createAuditLog } from "@/prisma/audit-log";
import { updateInventoryAdjustmentSchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adjustment = await prisma.inventoryAdjustment.findUnique({
      where: { id },
      include: {
        warehouse: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!adjustment) {
      return NextResponse.json(
        { error: "Inventory adjustment not found" },
        { status: 404 }
      );
    }

    // Convert BigInt to number for JSON serialization
    const sanitizedAdjustment = {
      ...adjustment,
      items: adjustment.items.map(item => ({
        ...item,
        variance: Number(item.variance),
        expectedQuantity: Number(item.expectedQuantity),
        countedQuantity: Number(item.countedQuantity),
        product: item.product ? {
          ...item.product,
          quantity: Number(item.product.quantity),
          price: Number(item.product.price)
        } : null
      }))
    };

    return NextResponse.json(sanitizedAdjustment);
  } catch (error) {
    logger.error("Error fetching inventory adjustment", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory adjustment" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getSessionFromRequest(request);
    if (!session || session.role === "supplier") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.inventoryAdjustment.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Adjustment not found" },
        { status: 404 }
      );
    }

    // Don't allow modification if already validated
    if (existing.status === "validated") {
      return NextResponse.json(
        { error: "Cannot modify a validated adjustment" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = updateInventoryAdjustmentSchema.safeParse({ id, ...body });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { status, reason, items } = validation.data;

    // Use a transaction if we are validating (meaning we must apply stock changes) or updating multiple items
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update the adjustment record and apply item changes
      if (items && items.length > 0) {
        // Delete all old items and recreate (simplest way to handle array changes in draft)
        await tx.inventoryAdjustmentItem.deleteMany({
          where: { adjustmentId: id },
        });

        await tx.inventoryAdjustmentItem.createMany({
          data: items.map((item) => ({
            adjustmentId: id,
            productId: item.productId,
            expectedQuantity: item.expectedQuantity,
            countedQuantity: item.countedQuantity,
            variance: item.countedQuantity - item.expectedQuantity,
            notes: item.notes,
          })),
        });
      }

      // Re-fetch items to guarantee we have exactly what exists now
      const currentItems = await tx.inventoryAdjustmentItem.findMany({
        where: { adjustmentId: id },
      });

      const updated = await tx.inventoryAdjustment.update({
        where: { id },
        data: {
          ...(reason !== undefined && { reason }),
          ...(status && {
            status,
            validatedAt: status === "validated" ? new Date() : null,
          }),
        },
        include: {
          items: true,
        },
      });

      // 2. If status is being changed to 'validated', we must apply to product/stock
      if (status === "validated" && existing.status !== "validated") {
        for (const item of currentItems) {
          if (item.variance !== 0) {
            // Log the stock movement
            await tx.stockMovement.create({
              data: {
                productId: item.productId,
                movementType: "ADJUSTMENT",
                quantity: item.variance, // Positive if counted > expected, negative otherwise
                source: existing.referenceNumber,
                destination: existing.warehouseId,
                referenceDocument: existing.id,
                userId: session.id,
              },
            });

            // Update product stock (for now, updating the total quantity on Product, similar to receipt)
            const product = await tx.product.findUnique({ where: { id: item.productId } });
            if (product) {
              const newQuantity = Number(product.quantity) + item.variance;
              await tx.product.update({
                where: { id: product.id },
                data: { quantity: BigInt(Math.max(0, newQuantity)) },
              });
            }

            const stockRec = await tx.stock.findUnique({
              where: {
                productId_warehouseId: {
                  productId: item.productId,
                  warehouseId: existing.warehouseId,
                },
              },
            });

            if (stockRec) {
              await tx.stock.update({
                where: { id: stockRec.id },
                data: { quantity: Math.max(0, stockRec.quantity + item.variance) },
              });
            } else {
              // Create stock record if it doesn't exist but we counted something
              if (item.countedQuantity > 0) {
                await tx.stock.create({
                  data: {
                    productId: item.productId,
                    warehouseId: existing.warehouseId,
                    quantity: item.countedQuantity,
                    userId: session.id,
                  },
                });
              }
            }
          }
        }
      }

      return updated;
    });

    try {
      await createAuditLog({
        userId: session.id,
        action: "update",
        entityType: "inventory_adjustment",
        entityId: id,
        details: { status, reason },
      });
    } catch (e) {
      // Ignore audit
    }

    return NextResponse.json(result);
  } catch (error) {
    logger.error("Error updating adjustment", error);
    return NextResponse.json(
      { error: "Failed to update adjustment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getSessionFromRequest(request);
    if (!session || session.role === "supplier") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.inventoryAdjustment.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (existing.status === "validated") {
      return NextResponse.json(
        { error: "Cannot delete a validated adjustment" },
        { status: 400 }
      );
    }

    await prisma.inventoryAdjustment.delete({
      where: { id },
    });

    try {
      await createAuditLog({
        userId: session.id,
        action: "delete",
        entityType: "inventory_adjustment",
        entityId: id,
      });
    } catch (e) {}

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error deleting adjustment", error);
    return NextResponse.json(
      { error: "Failed to delete adjustment" },
      { status: 500 }
    );
  }
}
