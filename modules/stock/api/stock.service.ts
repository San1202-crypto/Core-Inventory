import { prisma } from "@/prisma/client";
import { type Stock, StockMovementType } from "@prisma/client";
import { StockMovementService } from "@/modules/stock-movement/api/stock-movement.service";

/**
 * Service to handle all stock operations.
 */
export class StockService {
  /**
   * Get all stock records across all warehouses.
   */
  static async getAllStocks(): Promise<Stock[]> {
    return await prisma.stock.findMany({
      include: {
        product: { select: { name: true, sku: true } },
        warehouse: { select: { name: true, location: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  /**
   * Get stock records for a specific product across all warehouses.
   */
  static async getStockByProduct(productId: string): Promise<Stock[]> {
    return await prisma.stock.findMany({
      where: { productId },
      include: {
        warehouse: { select: { name: true, location: true } },
      },
    });
  }

  /**
   * Get all stock records in a specific warehouse.
   */
  static async getStockByWarehouse(warehouseId: string): Promise<Stock[]> {
    return await prisma.stock.findMany({
      where: { warehouseId },
      include: {
        product: { select: { name: true, sku: true } },
      },
    });
  }

  /**
   * Create a new stock record. Validates that it doesn't already exist.
   * Also logs a RECEIPT movement.
   */
  static async createStock(data: {
    productId: string;
    warehouseId: string;
    quantity: number;
    userId: string;
  }): Promise<Stock> {
    const existing = await prisma.stock.findUnique({
      where: {
        productId_warehouseId: {
          productId: data.productId,
          warehouseId: data.warehouseId,
        },
      },
    });

    if (existing) {
      throw new Error("Stock record already exists for this product in this warehouse.");
    }

    if (data.quantity < 0) {
      throw new Error("Initial stock quantity cannot be negative.");
    }

    const stock = await prisma.stock.create({
      data: {
        productId: data.productId,
        warehouseId: data.warehouseId,
        quantity: data.quantity,
        userId: data.userId,
      },
      include: {
        product: { select: { name: true, sku: true } },
        warehouse: { select: { name: true } },
      },
    });

    // Automatically log a movement if initial quantity > 0
    if (data.quantity > 0) {
      await StockMovementService.createMovement({
        productId: data.productId,
        movementType: StockMovementType.RECEIPT,
        quantity: data.quantity,
        destinationWarehouseId: data.warehouseId,
        referenceType: "Initial Stock",
        userId: data.userId,
      });
    }

    return stock;
  }

  /**
   * Update an existing stock record by ID.
   * Also logs a movement based on the quantity change.
   */
  static async updateStock(
    id: string,
    data: { quantity?: number; reservedQuantity?: number; userId: string; referenceType?: string; referenceId?: string },
  ): Promise<Stock> {
    const stock = await prisma.stock.findUnique({ 
        where: { id },
        include: { product: true }
    });
    
    if (!stock) {
      throw new Error("Stock record not found.");
    }

    // Business Logic: Real quantity cannot go below 0.
    const updatedQuantity = data.quantity ?? stock.quantity;
    if (updatedQuantity < 0) {
      throw new Error("Stock quantity cannot be less than zero.");
    }

    const diff = updatedQuantity - stock.quantity;

    const updatedStock = await prisma.stock.update({
      where: { id },
      data: {
        quantity: updatedQuantity,
        reservedQuantity: data.reservedQuantity ?? stock.reservedQuantity,
        updatedAt: new Date(),
      },
    });

    // Log movement if quantity changed
    if (diff !== 0) {
      await StockMovementService.createMovement({
        productId: stock.productId,
        movementType: diff > 0 ? StockMovementType.RECEIPT : StockMovementType.ADJUSTMENT,
        quantity: diff,
        destinationWarehouseId: diff > 0 ? stock.warehouseId : undefined,
        sourceWarehouseId: diff < 0 ? stock.warehouseId : undefined,
        referenceType: data.referenceType || "Stock Update",
        referenceId: data.referenceId,
        userId: data.userId,
      });
    }

    return updatedStock;
  }

  /**
   * Adjust stock manually (INCREASE/DECREASE) with reason.
   */
  static async adjustStock(data: {
    productId: string;
    warehouseId: string;
    quantity: number;
    type: "INCREASE" | "DECREASE";
    reason: string;
    userId: string;
  }): Promise<Stock> {
    const qtyChange = data.type === "INCREASE" ? data.quantity : -data.quantity;

    return await prisma.$transaction(async (tx) => {
      // 1. Update total product quantity
      const product = await tx.product.update({
        where: { id: data.productId },
        data: { quantity: { increment: qtyChange } },
      });

      if (product.quantity < 0) {
        throw new Error("Adjustment would result in negative total product quantity.");
      }

      // 2. Update specific warehouse stock
      const stock = await tx.stock.upsert({
        where: {
          productId_warehouseId: {
            productId: data.productId,
            warehouseId: data.warehouseId,
          },
        },
        create: {
          productId: data.productId,
          warehouseId: data.warehouseId,
          quantity: qtyChange,
          userId: data.userId,
        },
        update: {
          quantity: { increment: qtyChange },
        },
        include: { warehouse: true },
      });

      if (stock.quantity < 0) {
        throw new Error(`Adjustment would result in negative stock at warehouse: ${stock.warehouse.name}`);
      }

      // 3. Create movement record
      await tx.stockMovement.create({
        data: {
          productId: data.productId,
          movementType: "ADJUSTMENT",
          quantity: Math.abs(data.quantity),
          source: data.type === "DECREASE" ? stock.warehouse.name : "MANUAL_ADJUSTMENT",
          destination: data.type === "INCREASE" ? stock.warehouse.name : "MANUAL_ADJUSTMENT",
          referenceDocument: `ADJ-${Date.now()}`,
          userId: data.userId,
          notes: data.reason,
        },
      });

      return stock;
    });
  }

  /**
   * Transfer stock between warehouses.
   */
  static async transferStock(data: {
    productId: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    quantity: number;
    userId: string;
  }): Promise<void> {
    if (data.fromWarehouseId === data.toWarehouseId) {
      throw new Error("Source and destination warehouses cannot be the same.");
    }

    await prisma.$transaction(async (tx) => {
      // 1. Decrement from source
      const fromStock = await tx.stock.update({
        where: {
          productId_warehouseId: {
            productId: data.productId,
            warehouseId: data.fromWarehouseId,
          },
        },
        data: { quantity: { decrement: data.quantity } },
        include: { warehouse: true },
      });

      if (fromStock.quantity < 0) {
        throw new Error(`Insufficient stock in ${fromStock.warehouse.name}.`);
      }

      // 2. Increment to destination
      const toStock = await tx.stock.upsert({
        where: {
          productId_warehouseId: {
            productId: data.productId,
            warehouseId: data.toWarehouseId,
          },
        },
        create: {
          productId: data.productId,
          warehouseId: data.toWarehouseId,
          quantity: data.quantity,
          userId: data.userId,
        },
        update: {
          quantity: { increment: data.quantity },
        },
        include: { warehouse: true },
      });

      // 3. Create movement records (OUT and IN)
      await tx.stockMovement.createMany({
        data: [
          {
            productId: data.productId,
            movementType: "TRANSFER_OUT",
            quantity: data.quantity,
            source: fromStock.warehouse.name,
            destination: toStock.warehouse.name,
            referenceDocument: `TRF-${Date.now()}`,
            userId: data.userId,
          },
          {
            productId: data.productId,
            movementType: "TRANSFER_IN",
            quantity: data.quantity,
            source: fromStock.warehouse.name,
            destination: toStock.warehouse.name,
            referenceDocument: `TRF-${Date.now()}`,
            userId: data.userId,
          },
        ],
      });
    });
  }
}
