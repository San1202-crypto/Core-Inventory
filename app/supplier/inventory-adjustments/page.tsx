"use client";

import React, { useState } from "react";
import { useInventoryAdjustments } from "@/hooks/queries/useInventoryAdjustments";
import { 
  FileWarning, 
  Search, 
  ArrowRight,
  Eye,
  History,
  CheckCircle,
  Clock,
  Warehouse
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import AdjustmentDialog from "@/components/admin/inventory-adjustments/AdjustmentDialog";
import { useWarehouses } from "@/hooks/queries/use-warehouses";

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "draft":
      return <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800">DRAFT</Badge>;
    case "validated":
      return <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">VALIDATED</Badge>;
    default:
      return <Badge variant="outline">{status.toUpperCase()}</Badge>;
  }
};

export default function SupplierAdjustmentsPage() {
  const { data: adjustments, isLoading } = useInventoryAdjustments();
  const { data: warehouses } = useWarehouses();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAdjustment, setSelectedAdjustment] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredAdjustments = adjustments?.filter(adj => 
    adj.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (adj.reason || "").toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleOpenDetail = (adj: any) => {
    setSelectedAdjustment(adj);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Inventory Adjustments</h1>
          <p className="text-muted-foreground">Monitor stock corrections related to your products.</p>
        </div>
        
        <div className="flex items-center gap-2">
           <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reference or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-11 rounded-[28px] border-zinc-400/20 bg-white dark:bg-zinc-900/50"
            />
          </div>
        </div>
      </div>

      <article className={cn(
        "rounded-[28px] border border-zinc-400/20 dark:border-zinc-400/30 p-1 sm:p-2 backdrop-blur-sm transition-all",
        "bg-white/60 dark:bg-white/5",
        "shadow-[0_15px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.2)]"
      )}>
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredAdjustments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
             <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
               <History className="h-6 w-6" />
             </div>
             <p className="text-zinc-500 font-medium">No adjustments found</p>
             <p className="text-sm text-zinc-400 max-w-xs mx-auto">
               Inventory adjustments involving your products will appear here.
             </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Reference</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdjustments.map((adj) => (
                  <TableRow key={adj.id} className="group hover:bg-zinc-500/5 transition-colors">
                    <TableCell className="font-medium font-mono text-zinc-600 dark:text-zinc-300">
                      {adj.referenceNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                        <Warehouse className="h-3.5 w-3.5" />
                        {adj.warehouse?.name || "Unknown"}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-zinc-500 dark:text-zinc-400">
                      {adj.reason || "-"}
                    </TableCell>
                    <TableCell>
                       <Badge variant="secondary" className="font-normal bg-zinc-100 dark:bg-zinc-800">
                        {adj.items?.length || 0} Products
                       </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(adj.status)}
                    </TableCell>
                    <TableCell className="text-zinc-500 dark:text-zinc-400 text-sm">
                      {format(new Date(adj.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleOpenDetail(adj)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </article>

      {selectedAdjustment && (
        <AdjustmentDialog
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          warehouses={warehouses || []}
          existingData={selectedAdjustment}
          mode="view"
        />
      )}
    </div>
  );
}
