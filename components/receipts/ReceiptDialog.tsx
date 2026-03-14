"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { receiptSchema } from "@/lib/validations/receipt";
import { useCreateReceipt, useWarehouses } from "@/hooks/queries";
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
import { Label } from "@/components/ui/label";

interface ReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ReceiptDialog({ open, onOpenChange }: ReceiptDialogProps) {
  const { data: warehouses = [] } = useWarehouses();
  const createMutation = useCreateReceipt();

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm({
    resolver: zodResolver(receiptSchema),
    defaultValues: {
      supplierName: "",
      warehouseId: "",
    },
  });

  const warehouseId = watch("warehouseId");

  const onSubmit = async (values: any) => {
    try {
      await createMutation.mutateAsync(values);
      reset();
      onOpenChange(false);
    } catch (error) {
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Receipt</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="supplierName">Supplier Name</Label>
            <Input 
              id="supplierName"
              placeholder="Enter supplier name" 
              {...register("supplierName")} 
            />
            {errors.supplierName && (
              <p className="text-xs text-destructive">{errors.supplierName.message as string}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="warehouse">Warehouse</Label>
            <Select 
              value={warehouseId} 
              onValueChange={(value) => setValue("warehouseId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a warehouse" />
              </SelectTrigger>
              <SelectContent>
                {warehouses.length > 0 ? (
                  warehouses.map((warehouse: any) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name} ({warehouse.code})
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-xs text-center text-muted-foreground">
                    No warehouses found. Please create one in the Warehouses section.
                  </div>
                )}
              </SelectContent>
            </Select>
            {errors.warehouseId && (
              <p className="text-xs text-destructive">{errors.warehouseId.message as string}</p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending}
              className="bg-sky-600 hover:bg-sky-700 font-semibold"
            >
              {createMutation.isPending ? "Creating..." : "Create Receipt"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
