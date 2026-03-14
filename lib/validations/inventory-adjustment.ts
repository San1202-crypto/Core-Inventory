import { z } from "zod";

export const inventoryAdjustmentItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().min(1, "Product is required"),
  expectedQuantity: z.number().int().nonnegative(),
  countedQuantity: z.number().int().nonnegative("Count must be 0 or more"),
  notes: z.string().optional(),
  productName: z.string().optional(), // For UI purposes
});

export const inventoryAdjustmentSchema = z.object({
  warehouseId: z.string().min(1, "Warehouse is required"),
  reason: z.string().optional(),
  items: z.array(inventoryAdjustmentItemSchema).min(1, "At least one item is required"),
});

export type InventoryAdjustmentFormData = z.infer<typeof inventoryAdjustmentSchema>;

export const createInventoryAdjustmentSchema = z.object({
  warehouseId: z.string().min(1),
  reason: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().min(1),
    expectedQuantity: z.number().int().nonnegative(),
    countedQuantity: z.number().int().nonnegative(),
    notes: z.string().optional(),
  })).min(1),
});

export const updateInventoryAdjustmentSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["draft", "validated"]).optional(),
  reason: z.string().optional(),
  items: z.array(z.object({
    id: z.string().optional(),
    productId: z.string().min(1),
    expectedQuantity: z.number().int().nonnegative(),
    countedQuantity: z.number().int().nonnegative(),
    notes: z.string().optional(),
  })).optional(),
});
