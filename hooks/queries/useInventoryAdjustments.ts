import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  InventoryAdjustment,
  CreateInventoryAdjustmentInput,
  UpdateInventoryAdjustmentInput,
} from "@/types";

export const useInventoryAdjustments = (warehouseId?: string) => {
  return useQuery<InventoryAdjustment[]>({
    queryKey: ["inventory-adjustments", warehouseId],
    queryFn: async () => {
      const qs = warehouseId ? `?warehouseId=${warehouseId}` : "";
      const res = await fetch(`/api/inventory-adjustments${qs}`);
      if (!res.ok) throw new Error("Failed to fetch inventory adjustments");
      return res.json();
    },
  });
};

export const useInventoryAdjustment = (id: string) => {
  return useQuery<InventoryAdjustment>({
    queryKey: ["inventory-adjustments", id],
    queryFn: async () => {
      const res = await fetch(`/api/inventory-adjustments/${id}`);
      if (!res.ok) throw new Error("Failed to fetch inventory adjustment");
      return res.json();
    },
    enabled: !!id,
  });
};

export const useCreateInventoryAdjustment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateInventoryAdjustmentInput) => {
      const res = await fetch("/api/inventory-adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create adjustment");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Inventory adjustment created as draft",
      });
      queryClient.invalidateQueries({ queryKey: ["inventory-adjustments"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateInventoryAdjustment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UpdateInventoryAdjustmentInput) => {
      const { id, ...payload } = data;
      const res = await fetch(`/api/inventory-adjustments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update adjustment");
      }
      return res.json();
    },
    onSuccess: (data, variables) => {
      if (variables.status === "validated") {
        toast({
          title: "Success",
          description: "Inventory adjustment validated successfully",
        });
      } else {
        toast({
          title: "Success",
          description: "Inventory adjustment updated",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["inventory-adjustments"] });
      // Invalidate products because stock quantities might have changed if validated
      if (variables.status === "validated") {
        queryClient.invalidateQueries({ queryKey: ["products"] });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteInventoryAdjustment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/inventory-adjustments/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete adjustment");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Inventory adjustment deleted",
      });
      queryClient.invalidateQueries({ queryKey: ["inventory-adjustments"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
