"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Settings2, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product, Warehouse } from "@/types";

interface StockAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  warehouses: Warehouse[];
}

export default function StockAdjustmentDialog({
  open,
  onOpenChange,
  products,
  warehouses,
}: StockAdjustmentDialogProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      productId: "",
      warehouseId: "",
      quantity: 1,
      type: "INCREASE" as "INCREASE" | "DECREASE",
      reason: "",
    },
  });

  const selectedProductId = watch("productId");
  const selectedType = watch("type");

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/stocks/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast({ title: "Success", description: "Stock adjusted successfully" });
        queryClient.invalidateQueries({ queryKey: ["stocks"] });
        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
        reset();
        onOpenChange(false);
      } else {
        toast({ title: "Error", description: result.error || "Failed to adjust stock", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-white/10 bg-zinc-900/90 backdrop-blur-xl text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            <Settings2 className="w-6 h-6 text-amber-400" />
            Adjust Stock
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Manually correct stock levels for damages, shrinkage, or corrections.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-400">Product</Label>
              <Select onValueChange={(val) => setValue("productId", val)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-white/10 text-white">
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-400">Warehouse</Label>
              <Select onValueChange={(val) => setValue("warehouseId", val)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select a warehouse" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-white/10 text-white">
                  {warehouses.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-400">Type</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={selectedType === "INCREASE" ? "default" : "outline"}
                    className={`flex-1 gap-2 ${selectedType === "INCREASE" ? "bg-emerald-500 hover:bg-emerald-600 border-transparent text-white" : "border-white/10 text-zinc-400"}`}
                    onClick={() => setValue("type", "INCREASE")}
                  >
                    <ArrowUpCircle className="w-4 h-4" />
                    In
                  </Button>
                  <Button
                    type="button"
                    variant={selectedType === "DECREASE" ? "default" : "outline"}
                    className={`flex-1 gap-2 ${selectedType === "DECREASE" ? "bg-rose-500 hover:bg-rose-600 border-transparent text-white" : "border-white/10 text-zinc-400"}`}
                    onClick={() => setValue("type", "DECREASE")}
                  >
                    <ArrowDownCircle className="w-4 h-4" />
                    Out
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400">Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  {...register("quantity", { valueAsNumber: true })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-400">Reason / Note</Label>
              <Input
                placeholder="e.g., Damaged during handling, Return to vendor"
                {...register("reason")}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-zinc-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
            >
              {isSubmitting ? "Processing..." : "Confirm Adjustment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
