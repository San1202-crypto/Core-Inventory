"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeftRight, 
  ArrowRight,
  Warehouse as WarehouseIcon,
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

interface InternalTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  warehouses: Warehouse[];
}

export default function InternalTransferDialog({
  open,
  onOpenChange,
  products,
  warehouses,
}: InternalTransferDialogProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      productId: "",
      fromWarehouseId: "",
      toWarehouseId: "",
      quantity: 1,
    },
  });

  const onSubmit = async (data: any) => {
    if (data.fromWarehouseId === data.toWarehouseId) {
      toast({ title: "Invalid Transfer", description: "Source and destination warehouses must be different.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/stocks/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast({ title: "Success", description: "Stock transferred successfully" });
        queryClient.invalidateQueries({ queryKey: ["stocks"] });
        queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
        reset();
        onOpenChange(false);
      } else {
        toast({ title: "Error", description: result.error || "Failed to transfer stock", variant: "destructive" });
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
            <ArrowLeftRight className="w-6 h-6 text-blue-400" />
            Internal Transfer
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Move stock from one warehouse to another.
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

            <div className="grid grid-cols-1 gap-6 relative p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="space-y-2">
                <Label className="text-zinc-400 flex items-center gap-2">
                  <WarehouseIcon className="w-3 h-3 opacity-50" />
                  From Source
                </Label>
                <Select onValueChange={(val) => setValue("fromWarehouseId", val)}>
                  <SelectTrigger className="bg-zinc-950/50 border-white/10 text-white">
                    <SelectValue placeholder="Select source" />
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

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 p-2 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50 hidden sm:block">
                <ArrowRight className="w-4 h-4 text-white" />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400 flex items-center gap-2">
                  <WarehouseIcon className="w-3 h-3 opacity-50 text-blue-400" />
                  To Destination
                </Label>
                <Select onValueChange={(val) => setValue("toWarehouseId", val)}>
                  <SelectTrigger className="bg-zinc-950/50 border-white/10 text-white">
                    <SelectValue placeholder="Select destination" />
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
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-400">Transfer Quantity</Label>
              <Input
                type="number"
                min="1"
                {...register("quantity", { valueAsNumber: true })}
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              {isSubmitting ? "Processing..." : "Initiate Transfer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
