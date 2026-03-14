"use client";

import React, { useState } from "react";
import { useReceipt, useProducts, useAddReceiptItems } from "@/hooks/queries";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Package } from "lucide-react";

interface ReceiptItemsDialogProps {
  receiptId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ReceiptItemsDialog({ receiptId, open, onOpenChange }: ReceiptItemsDialogProps) {
  const { data: receipt, isLoading: receiptLoading } = useReceipt(receiptId);
  const { data: products = [] } = useProducts();
  const addItemsMutation = useAddReceiptItems();

  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [newItems, setNewItems] = useState<{ productId: string; productName: string; quantityReceived: number }[]>([]);

  const handleAddItem = () => {
    if (!selectedProductId || !quantity) return;
    
    const product = products.find((p: any) => p.id === selectedProductId);
    if (!product) return;

    const qty = parseInt(quantity);
    if (qty <= 0) return;

    setNewItems([...newItems, {
      productId: selectedProductId,
      productName: product.name,
      quantityReceived: qty
    }]);

    setSelectedProductId("");
    setQuantity("1");
  };

  const handleRemoveItem = (index: number) => {
    setNewItems(newItems.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (newItems.length === 0) return;
    
    try {
      await addItemsMutation.mutateAsync({
        receiptId,
        items: newItems.map(({ productId, quantityReceived }) => ({
          productId,
          quantityReceived
        }))
      });
      setNewItems([]);
      onOpenChange(false);
    } catch (error) {
    }
  };

  const isDraft = receipt?.status === "draft";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Items for Receipt {receipt?.receiptNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* List Existing Items */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" /> Current Items
            </h4>
            <div className="rounded-md border text-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Qty Received</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receiptLoading ? (
                    <TableRow><TableCell colSpan={2} className="text-center">Loading...</TableCell></TableRow>
                  ) : receipt?.items.length === 0 && newItems.length === 0 ? (
                    <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">No items added yet</TableCell></TableRow>
                  ) : (
                    <>
                      {receipt?.items.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.product.name} <span className="text-xs text-muted-foreground">({item.product.sku})</span></TableCell>
                          <TableCell className="text-right font-medium">{item.quantityReceived}</TableCell>
                        </TableRow>
                      ))}
                      {newItems.map((item, index) => (
                        <TableRow key={`new-${index}`} className="bg-sky-50/50 dark:bg-sky-500/5">
                          <TableCell>{item.productName} <Badge variant="outline" className="ml-2 text-[10px] h-4">NEW</Badge></TableCell>
                          <TableCell className="text-right font-medium flex items-center justify-end gap-2">
                            {item.quantityReceived}
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleRemoveItem(index)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Add New Section (Only if Draft) */}
          {isDraft && (
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-dashed border-gray-300 dark:border-zinc-700">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Add Products</h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full sm:w-24">
                  <Input 
                    type="number" 
                    min="1" 
                    value={quantity} 
                    onChange={(e) => setQuantity(e.target.value)} 
                    placeholder="Qty"
                  />
                </div>
                <Button onClick={handleAddItem} disabled={!selectedProductId} className="bg-sky-600 hover:bg-sky-700">
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isDraft ? "Cancel" : "Close"}
          </Button>
          {isDraft && newItems.length > 0 && (
            <Button onClick={handleSave} disabled={addItemsMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700">
              {addItemsMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
