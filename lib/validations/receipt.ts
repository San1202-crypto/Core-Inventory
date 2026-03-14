import { z } from "zod";

export const receiptItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantityReceived: z.number().int().positive("Quantity must be greater than 0"),
});

export const receiptSchema = z.object({
  supplierName: z.string().min(1, "Supplier name is required"),
  warehouseId: z.string().min(1, "Warehouse ID is required"),
});

export const addReceiptItemsSchema = z.object({
  items: z.array(receiptItemSchema).min(1, "At least one item is required"),
});
