import { Product } from "./product";
import { Warehouse } from "./warehouse";

export type InventoryAdjustmentStatus = "draft" | "validated";

export interface InventoryAdjustmentItem {
  id: string;
  adjustmentId: string;
  productId: string;
  expectedQuantity: number;
  countedQuantity: number;
  variance: number;
  notes?: string | null;
  product?: Product;
}

export interface InventoryAdjustment {
  id: string;
  referenceNumber: string;
  warehouseId: string;
  status: InventoryAdjustmentStatus;
  reason?: string | null;
  userId: string;
  createdAt: string | Date;
  validatedAt?: string | Date | null;
  items?: InventoryAdjustmentItem[];
  warehouse?: Warehouse;
}

export interface CreateInventoryAdjustmentInput {
  warehouseId: string;
  reason?: string;
  items: {
    productId: string;
    expectedQuantity: number;
    countedQuantity: number;
    notes?: string;
  }[];
}

export interface UpdateInventoryAdjustmentInput {
  id: string;
  status?: InventoryAdjustmentStatus;
  reason?: string;
  items?: {
    id?: string;
    productId: string;
    expectedQuantity: number;
    countedQuantity: number;
    notes?: string;
  }[];
}
