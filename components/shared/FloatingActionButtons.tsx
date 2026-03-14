"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Package,
  Tag,
  Truck,
  ShoppingCart,
  FileText,
  Warehouse,
} from "lucide-react";
import AddProductDialog from "@/components/products/ProductFormDialog";
import AddCategoryDialog from "@/components/category/CategoryDialog";
import AddSupplierDialog from "@/components/supplier/SupplierDialog";
import OrderDialog from "@/components/orders/OrderDialog";
import InvoiceDialog from "@/components/invoices/InvoiceDialog";
import WarehouseDialog from "@/components/warehouses/WarehouseDialog";
import { Product } from "@/types";

export type FloatingActionButtonsVariant =
  | "home"
  | "orders"
  | "invoices"
  | "suppliers"
  | "warehouses"
  | "categories"
  | "products"
  | "products-client";

interface FloatingActionButtonsProps {
  /** "home" = all FABs (Product, Category, Supplier, Order); "orders" = Create Order only; "products-client" = Create Order only (client, tied to product owner select) */
  variant?: FloatingActionButtonsVariant;
  allProducts?: Product[];
  userId?: string;
  /** For variant "products-client": product owner ID - button disabled when empty */
  selectedOwnerId?: string;
}

export default function FloatingActionButtons({
  variant = "home",
  allProducts = [],
  userId = "",
  selectedOwnerId = "",
}: FloatingActionButtonsProps) {
  const [isAnyHovered, setIsAnyHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsAnyHovered(true);
  };

  const handleMouseLeave = () => {
    setIsAnyHovered(false);
  };

  const buttonBaseClass =
    "h-14 rounded-full border-2 border-foreground/10 bg-background text-foreground shadow-none backdrop-blur-sm transition-all duration-300 hover:border-foreground flex items-center justify-center gap-2 font-black uppercase tracking-tighter text-[10px] font-montserrat";

  return (
    <div
      className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-3"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Add Product Button - home or products page */}
      {(variant === "home" || variant === "products") && (
        <div
          className={`relative flex justify-end transition-all duration-300 ${
            isAnyHovered ? "w-[160px]" : "w-14"
          }`}
        >
          <AddProductDialog allProducts={allProducts} userId={userId}>
            <Button
              className={`${buttonBaseClass} ${
                isAnyHovered ? "w-auto px-4" : "w-14 px-0"
              }`}
            >
              <Package className="h-5 w-5 flex-shrink-0" />
              <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                  isAnyHovered
                    ? "max-w-[120px] opacity-100"
                    : "max-w-0 opacity-0"
                }`}
              >
                Add Product
              </span>
            </Button>
          </AddProductDialog>
        </div>
      )}

      {/* Add Category Button - home or categories page */}
      {(variant === "home" || variant === "categories") && (
        <div
          className={`relative flex justify-end transition-all duration-300 ${
            isAnyHovered ? "w-[160px]" : "w-14"
          }`}
        >
          <AddCategoryDialog>
            <Button
              className={`${buttonBaseClass} ${
                isAnyHovered ? "w-auto px-4" : "w-14 px-0"
              }`}
            >
              <Tag className="h-5 w-5 flex-shrink-0" />
              <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                  isAnyHovered
                    ? "max-w-[120px] opacity-100"
                    : "max-w-0 opacity-0"
                }`}
              >
                Add Category
              </span>
            </Button>
          </AddCategoryDialog>
        </div>
      )}

      {/* Add Supplier Button - home or suppliers page */}
      {(variant === "home" || variant === "suppliers") && (
        <div
          className={`relative flex justify-end transition-all duration-300 ${
            isAnyHovered ? "w-[160px]" : "w-14"
          }`}
        >
          <AddSupplierDialog>
            <Button
              className={`${buttonBaseClass} ${
                isAnyHovered ? "w-auto px-4" : "w-14 px-0"
              }`}
            >
              <Truck className="h-5 w-5 flex-shrink-0" />
              <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                  isAnyHovered
                    ? "max-w-[120px] opacity-100"
                    : "max-w-0 opacity-0"
                }`}
              >
                Add Supplier
              </span>
            </Button>
          </AddSupplierDialog>
        </div>
      )}

      {/* Create Order Button - home, orders, or client products page */}
      {(variant === "home" ||
        variant === "orders" ||
        variant === "products-client") && (
        <div
          className={`relative flex justify-end transition-all duration-300 ${
            isAnyHovered ? "w-[160px]" : "w-14"
          }`}
        >
          <OrderDialog defaultOwnerId={selectedOwnerId || undefined}>
            <Button
              disabled={variant === "products-client" && !selectedOwnerId}
              className={`${buttonBaseClass} ${
                isAnyHovered ? "w-auto px-4" : "w-14 px-0"
              } ${
                variant === "products-client" && !selectedOwnerId
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <ShoppingCart className="h-5 w-5 flex-shrink-0" />
              <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                  isAnyHovered
                    ? "max-w-[120px] opacity-100"
                    : "max-w-0 opacity-0"
                }`}
              >
                Create Order
              </span>
            </Button>
          </OrderDialog>
        </div>
      )}

      {/* Add Warehouse Button - home or warehouses page */}
      {(variant === "home" || variant === "warehouses") && (
        <div
          className={`relative flex justify-end transition-all duration-300 ${
            isAnyHovered ? "w-[160px]" : "w-14"
          }`}
        >
          <WarehouseDialog>
            <Button
              className={`${buttonBaseClass} ${
                isAnyHovered ? "w-auto px-4" : "w-14 px-0"
              }`}
            >
              <Warehouse className="h-5 w-5 flex-shrink-0" />
              <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                  isAnyHovered
                    ? "max-w-[120px] opacity-100"
                    : "max-w-0 opacity-0"
                }`}
              >
                Add Warehouse
              </span>
            </Button>
          </WarehouseDialog>
        </div>
      )}

      {/* Create Invoice Button - home or invoices page */}
      {(variant === "home" || variant === "invoices") && (
        <div
          className={`relative flex justify-end transition-all duration-300 ${
            isAnyHovered ? "w-[160px]" : "w-14"
          }`}
        >
          <InvoiceDialog>
            <Button
              className={`${buttonBaseClass} ${
                isAnyHovered ? "w-auto px-4" : "w-14 px-0"
              }`}
            >
              <FileText className="h-5 w-5 flex-shrink-0" />
              <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                  isAnyHovered
                    ? "max-w-[120px] opacity-100"
                    : "max-w-0 opacity-0"
                }`}
              >
                Create Invoice
              </span>
            </Button>
          </InvoiceDialog>
        </div>
      )}
    </div>
  );
}
