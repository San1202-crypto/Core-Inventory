"use client";

import React, { useState } from "react";
import { useReceipts, useCreateReceipt, useValidateReceipt } from "@/hooks/queries";
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
import { Plus, CheckCircle, PackagePlus, Eye } from "lucide-react";
import ReceiptDialog from "./ReceiptDialog";
import ReceiptItemsDialog from "./ReceiptItemsDialog";
import { format } from "date-fns";

export default function ReceiptList() {
  const { data: receipts = [], isLoading } = useReceipts();
  const validateMutation = useValidateReceipt();
  
  const [createOpen, setCreateOpen] = useState(false);
  const [itemsOpen, setItemsOpen] = useState(false);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);

  const handleValidate = async (id: string) => {
    if (confirm("Are you sure you want to validate this receipt? This will update stock and cannot be undone.")) {
      await validateMutation.mutateAsync(id);
    }
  };

  const openItems = (id: string) => {
    setSelectedReceiptId(id);
    setItemsOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 poppins">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Receipts (Incoming Goods)</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Track and manage items received from suppliers</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2 bg-sky-600 hover:bg-sky-700">
          <Plus className="h-4 w-4" /> Create Receipt
        </Button>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50/50 dark:bg-white/5">
            <TableRow>
              <TableHead>Receipt Number</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Loading receipts...</TableCell>
              </TableRow>
            ) : receipts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No receipts found</TableCell>
              </TableRow>
            ) : (
              receipts.map((receipt: any) => (
                <TableRow key={receipt.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                  <TableCell className="font-medium text-sky-600 dark:text-sky-400">{receipt.receiptNumber}</TableCell>
                  <TableCell>{receipt.supplierName}</TableCell>
                  <TableCell>{receipt.warehouse?.name || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={receipt.status === "validated" ? "default" : "secondary"}>
                      {receipt.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(receipt.createdAt), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => openItems(receipt.id)}
                        className="h-8 gap-1"
                      >
                        <PackagePlus className="h-3.5 w-3.5" /> Items ({receipt._count?.items || 0})
                      </Button>
                      
                      {receipt.status === "draft" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleValidate(receipt.id)}
                          disabled={validateMutation.isPending || receipt._count?.items === 0}
                          className="h-8 gap-1 border-emerald-500/50 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Validate
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ReceiptDialog open={createOpen} onOpenChange={setCreateOpen} />
      
      {selectedReceiptId && (
        <ReceiptItemsDialog 
          receiptId={selectedReceiptId} 
          open={itemsOpen} 
          onOpenChange={setItemsOpen} 
        />
      )}
    </div>
  );
}
