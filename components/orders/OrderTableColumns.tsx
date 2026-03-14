/**
 * Order Table Columns
 * Column definitions for the orders table using TanStack Table
 */

"use client";

import React from "react";
import { Column, ColumnDef } from "@tanstack/react-table";
import { Order } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpDown,
} from "lucide-react";
import { IoMdArrowDown, IoMdArrowUp } from "react-icons/io";
import { format } from "date-fns";
import Link from "next/link";
import OrderActions from "./OrderActions";

/**
 * Get order status badge color
 */
function getStatusColor(status: string): string {
  switch (status) {
    case "pending":
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-300";
    case "confirmed":
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-300";
    case "processing":
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-300";
    case "shipped":
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-300";
    case "delivered":
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-300";
    case "cancelled":
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
  }
}

/**
 * Get payment status badge color
 */
function getPaymentStatusColor(status: string): string {
  switch (status) {
    case "paid":
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-300";
    case "unpaid":
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-300";
    case "partial":
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-300";
    case "refunded":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
  }
}

/**
 * Get status icon
 */
function getStatusIcon(status: string) {
  switch (status) {
    case "pending":
      return <Clock className="h-3 w-3" />;
    case "confirmed":
      return <CheckCircle className="h-3 w-3" />;
    case "processing":
      return <Package className="h-3 w-3" />;
    case "shipped":
      return <Truck className="h-3 w-3" />;
    case "delivered":
      return <CheckCircle className="h-3 w-3" />;
    case "cancelled":
      return <XCircle className="h-3 w-3" />;
    default:
      return null;
  }
}

/**
 * Sortable Header Props
 */
type SortableHeaderProps = {
  column: Column<Order, unknown>;
  label: string;
};

/**
 * Sortable Header Component
 * Provides sorting functionality for table columns with dropdown menu
 * Matches Product/Category/Supplier table pattern
 */
const SortableHeader: React.FC<SortableHeaderProps> = ({ column, label }) => {
  const isSorted = column.getIsSorted();
  const SortingIcon =
    isSorted === "asc"
      ? IoMdArrowUp
      : isSorted === "desc"
        ? IoMdArrowDown
        : ArrowUpDown;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="" asChild>
        <div
          className={`flex items-center select-none cursor-pointer gap-1 py-2 text-gray-900 dark:text-white ${
            isSorted && "text-primary"
          }`}
          aria-label={`Sort by ${label}`}
        >
          {label}
          <SortingIcon className="h-4 w-4" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="bottom">
        {/* Ascending Sorting */}
        <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
          <IoMdArrowUp className="mr-2 h-4 w-4" />
          Asc
        </DropdownMenuItem>
        {/* Descending Sorting */}
        <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
          <IoMdArrowDown className="mr-2 h-4 w-4" />
          Desc
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/** Order with optional admin-combined source and display name */
export type OrderWithSource = Order & {
  _source?: "personal" | "client";
  _displayName?: string;
};

type CreateOrderColumnsOptions = {
  /** When true, show (displayName) and Self/Client badge under Order # */
  showSourceBadge?: boolean;
  /** When true, show placedByName / placedByEmail under Order # (e.g. supplier view) */
  showPlacedBy?: boolean;
  /** When true, show productOwnerName / productOwnerEmail under Order # (e.g. client view) */
  showProductOwner?: boolean;
};

/**
 * Order Table Columns Definition
 * Defines the columns for the order table with sorting and actions
 * Matches Category/Product/Supplier table pattern
 * @param detailHrefBase - When set (e.g. "/admin/orders"), View link uses {detailHrefBase}/{id}
 */
export const createOrderColumns = (
  onEdit: (order: Order) => void,
  detailHrefBase?: string,
  options?: CreateOrderColumnsOptions,
): ColumnDef<Order>[] => [
  {
    accessorKey: "orderNumber",
    header: ({ column }) => <SortableHeader column={column} label="Order #" />,
    cell: ({ row }) => {
      const order = row.original as OrderWithSource;
      const href = detailHrefBase
        ? `${detailHrefBase}/${order.id}`
        : `/orders/${order.id}`;
      const showBadge = options?.showSourceBadge && order._source != null;
      const showPlacedBy = options?.showPlacedBy && (order.placedByName || order.placedByEmail);
      const showProductOwner = options?.showProductOwner && (order.productOwnerName || order.productOwnerEmail);
      return (
        <div className="flex flex-col gap-0.5">
          <Link
            href={href}
            className="font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300"
          >
            {order.orderNumber}
          </Link>
          {showBadge && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {order._displayName != null && order._displayName !== "" && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {order._displayName}
                </span>
              )}
              <Badge
                className={
                  order._source === "personal"
                    ? "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-300 text-xs"
                    : "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-300 text-xs"
                }
              >
                {order._source === "personal" ? "Self" : "Client"}
              </Badge>
            </div>
          )}
          {showPlacedBy && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {order.placedByName}{order.placedByEmail ? ` (${order.placedByEmail})` : ""}
            </span>
          )}
          {showProductOwner && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {order.productOwnerName}{order.productOwnerEmail ? ` (${order.productOwnerEmail})` : ""}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => <SortableHeader column={column} label="Status" />,
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge className={getStatusColor(status)}>
          <span className="flex items-center gap-1">
            {getStatusIcon(status)}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </Badge>
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: ({ column }) => <SortableHeader column={column} label="Payment" />,
    cell: ({ row }) => {
      const paymentStatus = row.original.paymentStatus;
      return (
        <Badge className={getPaymentStatusColor(paymentStatus)}>
          {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "total",
    header: ({ column }) => <SortableHeader column={column} label="Total" />,
    cell: ({ getValue }) => {
      const total = getValue<number>();
      return <span className="font-semibold">${total.toFixed(2)}</span>;
    },
  },
  {
    accessorKey: "items",
    header: "Items",
    cell: ({ row }) => {
      const items = row.original.items || [];
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      return (
        <span>
          {totalItems} item{totalItems !== 1 ? "s" : ""}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <SortableHeader column={column} label="Date" />,
    cell: ({ getValue }) => {
      const date = getValue<Date>();
      return (
        <span className="text-sm">
          {format(new Date(date), "MMM dd, yyyy")}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <OrderActions
          order={row.original}
          onEdit={onEdit}
          detailHrefBase={detailHrefBase}
        />
      );
    },
  },
];

