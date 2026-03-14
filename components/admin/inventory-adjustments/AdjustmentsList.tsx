"use client";

import { useState } from "react";
import { useInventoryAdjustments } from "@/hooks/queries/useInventoryAdjustments";
import { useWarehouses } from "@/hooks/queries/use-warehouses";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import AdjustmentDialog from "./AdjustmentDialog";
import { columns } from "./AdjustmentsTableColumns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdjustmentsTable } from "./AdjustmentsTable";
import { Input } from "@/components/ui/input";
import { PaginationType } from "@/components/shared/PaginationSelector";

export default function AdjustmentsList() {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pagination, setPagination] = useState<PaginationType>({
    pageIndex: 0,
    pageSize: 8,
  });

  const { data: adjustments, isLoading } = useInventoryAdjustments(
    selectedWarehouseId === "all" ? undefined : selectedWarehouseId
  );
  
  const { data: warehouses } = useWarehouses();

  return (
    <div className="flex flex-col poppins">
      <div className="pb-6 flex flex-col items-start text-left">
        <h2 className="text-xl sm:text-2xl font-semibold text-primary/80 pb-2">
          Inventory Adjustments
        </h2>
        <p className="text-sm sm:text-base text-primary/60">
          Manage inventory cycle counts and stock adjustments to maintain accurate inventory levels.
        </p>
      </div>

      <div className="pb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search adjustments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-11 rounded-[28px] border-primary/20 bg-primary/5 shadow-sm"
            />
          </div>

          <div className="w-[200px]">
            <Select
              value={selectedWarehouseId}
              onValueChange={setSelectedWarehouseId}
            >
              <SelectTrigger className="h-11 rounded-[28px] border-primary/20 bg-primary/5 shadow-sm">
                <SelectValue placeholder="All Warehouses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Warehouses</SelectItem>
                {warehouses?.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={() => setIsDialogOpen(true)}
          className="h-11 rounded-[28px] border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent text-primary/80 hover:from-primary/15 transition-all font-medium px-6 shadow-[0_10px_35px_rgba(26,22,20,0.1)]"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Adjustment
        </Button>
      </div>

      <AdjustmentsTable
        columns={columns}
        data={adjustments || []}
        isLoading={isLoading}
        searchTerm={searchTerm}
        pagination={pagination}
        setPagination={setPagination}
      />

      <AdjustmentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        warehouses={warehouses || []}
      />
    </div>
  );
}
