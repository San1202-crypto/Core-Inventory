"use client";

import { InventoryAdjustment } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FileEdit, CheckCircle, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import AdjustmentDialog from "./AdjustmentDialog";
import { useDeleteInventoryAdjustment, useUpdateInventoryAdjustment } from "@/hooks/queries/useInventoryAdjustments";
import { useWarehouses } from "@/hooks/queries/use-warehouses";
import { format } from "date-fns";

export const columns: ColumnDef<InventoryAdjustment>[] = [
  {
    accessorKey: "referenceNumber",
    header: "Reference",
    cell: ({ row }) => <span className="font-medium">{row.getValue("referenceNumber")}</span>,
  },
  {
    accessorKey: "warehouse",
    header: "Warehouse",
    cell: ({ row }) => {
      const warehouse = row.original.warehouse;
      return <span>{warehouse?.name || "Unknown"}</span>;
    },
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => (
      <span className="text-muted-foreground truncate max-w-[200px] block">
        {row.getValue("reason") || "-"}
      </span>
    ),
  },
  {
    id: "itemsCount",
    header: "Items Adjusted",
    cell: ({ row }) => {
      const count = row.original.items?.length || 0;
      return <span>{count} item{count !== 1 ? "s" : ""}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={status === "validated" ? "default" : "secondary"}
          className={
            status === "validated"
              ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
              : "bg-orange-100 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400"
          }
        >
          {status.toUpperCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <span>{format(date, "MMM dd, yyyy")}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCell adjustment={row.original} />,
  },
];

function ActionCell({ adjustment }: { adjustment: InventoryAdjustment }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const deleteMutation = useDeleteInventoryAdjustment();
  const updateMutation = useUpdateInventoryAdjustment();
  const { data: warehouses } = useWarehouses();

  const isDraft = adjustment.status === "draft";

  const handleValidate = () => {
    if (confirm("Are you sure you want to validate this adjustment? This will update actual stock levels and cannot be undone.")) {
      updateMutation.mutate({
        id: adjustment.id,
        status: "validated",
      });
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this draft adjustment?")) {
      deleteMutation.mutate(adjustment.id);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <FileEdit className="mr-2 h-4 w-4" />
            {isDraft ? "Edit draft" : "View details"}
          </DropdownMenuItem>

          {isDraft && (
            <>
              <DropdownMenuItem onClick={handleValidate} className="text-green-600 dark:text-green-400">
                <CheckCircle className="mr-2 h-4 w-4" />
                Validate Adjustment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-600 dark:text-red-400">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Draft
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AdjustmentDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        warehouses={warehouses || []}
        existingData={adjustment}
        mode={isDraft ? "edit" : "view"}
      />
    </>
  );
}
