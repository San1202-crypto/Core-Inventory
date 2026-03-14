"use client";

import { useEffect } from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateInventoryAdjustment,
  useUpdateInventoryAdjustment,
} from "@/hooks/queries/useInventoryAdjustments";
import { useProducts } from "@/hooks/queries/use-products";
import { Trash2, Plus, AlertCircle } from "lucide-react";
import { createInventoryAdjustmentSchema } from "@/lib/validations/inventory-adjustment";
import type { Warehouse, InventoryAdjustment, Product } from "@/types";

// Form schema based on validation
type FormValues = z.infer<typeof createInventoryAdjustmentSchema>;

interface AdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouses: Warehouse[];
  existingData?: InventoryAdjustment;
  mode?: "create" | "edit" | "view";
}

export default function AdjustmentDialog({
  open,
  onOpenChange,
  warehouses,
  existingData,
  mode = "create",
}: AdjustmentDialogProps) {
  const isView = mode === "view";
  const { data: allProducts } = useProducts();
  const createMutation = useCreateInventoryAdjustment();
  const updateMutation = useUpdateInventoryAdjustment();

  const methods = useForm<FormValues>({
    resolver: zodResolver(createInventoryAdjustmentSchema),
    defaultValues: {
      warehouseId: "",
      reason: "",
      items: [
        { productId: "", expectedQuantity: 0, countedQuantity: 0, notes: "" },
      ],
    },
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  useEffect(() => {
    if (open) {
      if (existingData) {
        reset({
          warehouseId: existingData.warehouseId,
          reason: existingData.reason || "",
          items:
            existingData.items?.map((item) => ({
              productId: item.productId,
              expectedQuantity: item.expectedQuantity,
              countedQuantity: item.countedQuantity,
              notes: item.notes || "",
            })) || [],
        });
      } else {
        reset({
          warehouseId: "",
          reason: "",
          items: [
            {
              productId: "",
              expectedQuantity: 0,
              countedQuantity: 0,
              notes: "",
            },
          ],
        });
      }
    }
  }, [open, existingData, reset]);

  const onProductChange = (index: number, productId: string) => {
    const product = allProducts?.find((p: Product) => p.id === productId);
    if (product) {
      setValue(`items.${index}.expectedQuantity`, Number(product.quantity));
      setValue(`items.${index}.countedQuantity`, Number(product.quantity));
    }
  };

  const onSubmit = (data: FormValues) => {
    if (mode === "create") {
      createMutation.mutate(data, {
        onSuccess: () => onOpenChange(false),
      });
    } else if (mode === "edit" && existingData) {
      updateMutation.mutate(
        { id: existingData.id, ...data },
        { onSuccess: () => onOpenChange(false) },
      );
    }
  };

  const warehouseId = watch("warehouseId");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-4 sm:p-7 sm:px-8 poppins max-h-[95vh] overflow-hidden flex flex-col sm:max-w-[900px] border-zinc-400/30 dark:border-zinc-400/30 shadow-[0_30px_80px_rgba(0,0,0,0.2)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.2)] bg-zinc-50 dark:bg-[#0a0a0a]">
        <DialogHeader>
          <DialogTitle className="text-[22px] font-semibold text-zinc-900 dark:text-white">
            {mode === "create"
              ? "New Inventory Adjustment"
              : isView
                ? "View Adjustment Details"
                : "Edit Draft Adjustment"}
          </DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-white/70">
            {mode === "create"
              ? "Create a new cycle count or stock adjustment session."
              : `Reference: ${existingData?.referenceNumber}`}
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex-1 flex flex-col overflow-hidden space-y-6 mt-4"
          >
            <div className="flex-1 overflow-y-auto -mx-2 px-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Warehouse Destination
                    </Label>
                    <Select
                      disabled={isView || mode === "edit"}
                      onValueChange={(val) => setValue("warehouseId", val)}
                      value={warehouseId}
                    >
                      <SelectTrigger className="h-11 bg-white dark:bg-zinc-900/50 border-zinc-400/20 shadow-sm rounded-xl">
                        <SelectValue placeholder="Select warehouse..." />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses?.map((w) => (
                          <SelectItem key={w.id} value={w.id}>
                            {w.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.warehouseId && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.warehouseId.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Adjustment Reason
                    </Label>
                    <Input
                      disabled={isView}
                      placeholder="e.g. Monthly cycle count, found damaged items"
                      className="h-11 bg-white dark:bg-zinc-900/50 border-zinc-400/20 shadow-sm rounded-xl"
                      {...register("reason")}
                    />
                    {errors.reason && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.reason.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                      Adjustment Items
                    </h3>
                  </div>

                  <div className="rounded-2xl border border-zinc-400/10 dark:border-white/5 overflow-hidden">
                    <div className="bg-zinc-100/50 dark:bg-white/5 grid grid-cols-12 gap-2 p-3 text-xs font-bold text-zinc-500 uppercase">
                      <div className="col-span-5">Product</div>
                      <div className="col-span-2 text-center">Expected</div>
                      <div className="col-span-2 text-center">Counted</div>
                      <div className="col-span-2 text-center">Variance</div>
                      {!isView && <div className="col-span-1"></div>}
                    </div>

                    <div className="divide-y divide-zinc-400/10 dark:divide-white/5 bg-white/50 dark:bg-transparent">
                      {fields.map((field, index) => {
                        const expected = watch(`items.${index}.expectedQuantity`);
                        const counted = watch(`items.${index}.countedQuantity`);
                        const variance = (counted || 0) - (expected || 0);
                        const currentProductId = watch(`items.${index}.productId`);

                        return (
                          <div
                            key={field.id}
                            className="grid grid-cols-12 gap-2 p-3 items-center group transition-colors hover:bg-zinc-100/30 dark:hover:bg-white/[0.02]"
                          >
                            <div className="col-span-5">
                              <Select
                                disabled={isView}
                                onValueChange={(val) => {
                                  setValue(`items.${index}.productId` as any, val);
                                  onProductChange(index, val);
                                }}
                                value={currentProductId}
                              >
                                <SelectTrigger className="h-10 bg-white dark:bg-zinc-900/40 border-zinc-400/10 shadow-none rounded-lg text-sm">
                                  <SelectValue placeholder="Select product..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {allProducts?.map((p: Product) => (
                                    <SelectItem key={p.id} value={p.id}>
                                      {p.name} ({p.sku})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="col-span-2 text-center">
                              <span className="text-zinc-500 font-medium font-mono">
                                {expected}
                              </span>
                            </div>

                            <div className="col-span-2">
                              <Input
                                disabled={isView}
                                type="number"
                                min={0}
                                className="h-10 text-center bg-white dark:bg-zinc-900/40 border-zinc-400/10 shadow-none rounded-lg font-mono"
                                {...register(`items.${index}.countedQuantity` as any, {
                                  valueAsNumber: true,
                                })}
                              />
                            </div>

                            <div className="col-span-2 text-center font-bold flex justify-center items-center font-mono">
                              <span
                                className={
                                  variance > 0
                                    ? "text-emerald-500"
                                    : variance < 0
                                      ? "text-rose-500"
                                      : "text-zinc-400"
                                }
                              >
                                {variance > 0 ? `+${variance}` : variance}
                              </span>
                            </div>

                            {!isView && (
                              <div className="col-span-1 flex justify-end">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  disabled={fields.length === 1}
                                  onClick={() => remove(index)}
                                  className="text-zinc-400 hover:text-rose-500 transition-colors h-8 w-8 p-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {!isView && (
                      <div className="p-3 bg-zinc-50 dark:bg-white/[0.03] border-t border-zinc-400/10 dark:border-white/5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            append({
                              productId: "",
                              expectedQuantity: 0,
                              countedQuantity: 0,
                              notes: "",
                            })
                          }
                          className="w-full h-10 border-dashed border-2 border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 text-zinc-500 dark:text-zinc-400 rounded-xl"
                        >
                          <Plus className="mr-2 h-4 w-4" /> Add Product Item
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-zinc-400/10 dark:border-white/10 mt-auto">
              <div>
                {!isView && (
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Always double check quantities before validation.</span>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="h-11 rounded-[28px] px-6 border-zinc-400/20"
                >
                  {isView ? "Close" : "Cancel"}
                </Button>
                {!isView && (
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="h-11 rounded-[28px] px-8 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold shadow-lg shadow-zinc-200/50 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {mode === "create" ? "Save Adjustment" : "Update Draft"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
