import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

const queryKeys = {
  receipts: {
    all: ["receipts"] as const,
    lists: () => [...queryKeys.receipts.all, "list"] as const,
    details: (id: string) => [...queryKeys.receipts.all, "detail", id] as const,
  },
};

export function useReceipts() {
  return useQuery({
    queryKey: queryKeys.receipts.lists(),
    queryFn: async () => {
      const { data } = await axios.get("/api/receipts");
      return data;
    },
  });
}

export function useReceipt(id: string) {
  return useQuery({
    queryKey: queryKeys.receipts.details(id),
    queryFn: async () => {
      const { data } = await axios.get(`/api/receipts/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (receiptData: { supplierName: string; warehouseId: string }) => {
      const { data } = await axios.post("/api/receipts", receiptData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.receipts.lists() });
      toast({ title: "Receipt created successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create receipt",
        description: error.response?.data?.error || "An error occurred",
        variant: "destructive",
      });
    },
  });
}

export function useAddReceiptItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ receiptId, items }: { receiptId: string; items: any[] }) => {
      const { data } = await axios.post(`/api/receipts/${receiptId}/items`, { items });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.receipts.all });
      toast({ title: "Items added successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add items",
        description: error.response?.data?.error || "An error occurred",
        variant: "destructive",
      });
    },
  });
}

export function useValidateReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (receiptId: string) => {
      const { data } = await axios.post(`/api/receipts/${receiptId}/validate`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.receipts.all });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Receipt validated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to validate receipt",
        description: error.response?.data?.error || "An error occurred",
        variant: "destructive",
      });
    },
  });
}
