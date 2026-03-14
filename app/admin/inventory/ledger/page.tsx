"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight, 
  Settings2,
  Clock,
  Package,
  FileText,
  Download
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProducts, useWarehouses } from "@/hooks/queries";
import StockAdjustmentDialog from "@/components/stocks/StockAdjustmentDialog";
import InternalTransferDialog from "@/components/stocks/InternalTransferDialog";

interface Movement {
  id: string;
  productId: string;
  movementType: string;
  quantity: number;
  source: string | null;
  destination: string | null;
  referenceDocument: string | null;
  notes: string | null;
  createdAt: string;
  product: {
    name: string;
    sku: string;
    unitOfMeasure: string;
  };
}

export default function InventoryLedgerPage() {
  const { data, isLoading } = useQuery<{ success: boolean; data: Movement[] }>({
    queryKey: ["stock-movements"],
    queryFn: () => fetch("/api/stocks/movements").then((res) => res.json()),
  });

  const { data: products = [] } = useProducts();
  const { data: warehouses = [] } = useWarehouses();

  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  const movements = data?.data || [];

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "INCOMING":
      case "TRANSFER_IN":
        return <ArrowDownLeft className="text-emerald-400 w-4 h-4" />;
      case "OUTGOING":
      case "TRANSFER_OUT":
        return <ArrowUpRight className="text-rose-400 w-4 h-4" />;
      case "ADJUSTMENT":
        return <Settings2 className="text-amber-400 w-4 h-4" />;
      default:
        return <ArrowLeftRight className="text-blue-400 w-4 h-4" />;
    }
  };

  const getMovementBadge = (type: string) => {
    const variants: Record<string, string> = {
      INCOMING: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      OUTGOING: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      TRANSFER_IN: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      TRANSFER_OUT: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      ADJUSTMENT: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    };
    return variants[type] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-8 h-8 text-zinc-400" />
            Inventory Ledger
          </h1>
          <p className="text-zinc-400">
            A real-time record of all stock movements across your warehouses.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdjustOpen(true)}
            className="flex items-center gap-2 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white"
          >
            <Settings2 className="h-4 w-4" />
            Adjust Stock
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTransferOpen(true)}
            className="flex items-center gap-2 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white"
          >
            <ArrowLeftRight className="h-4 w-4" />
            Transfer Stock
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white"
          >
            <Download className="h-4 w-4" />
            Export Ledger
          </Button>
        </div>
      </div>

      <StockAdjustmentDialog 
        open={isAdjustOpen} 
        onOpenChange={setIsAdjustOpen} 
        products={products}
        warehouses={warehouses}
      />
      <InternalTransferDialog
        open={isTransferOpen}
        onOpenChange={setIsTransferOpen}
        products={products}
        warehouses={warehouses}
      />

      <Card className="border-white/10 bg-zinc-900/50 backdrop-blur-xl shadow-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-white/90">Move History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl overflow-hidden border border-white/5">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableHead className="text-zinc-400 font-medium">Date</TableHead>
                  <TableHead className="text-zinc-400 font-medium">Product</TableHead>
                  <TableHead className="text-zinc-400 font-medium">Type</TableHead>
                  <TableHead className="text-zinc-400 font-medium text-right">Change</TableHead>
                  <TableHead className="text-zinc-400 font-medium">Source / Destination</TableHead>
                  <TableHead className="text-zinc-400 font-medium">Reference</TableHead>
                  <TableHead className="text-zinc-400 font-medium">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-zinc-500">
                      Loading stock movements...
                    </TableCell>
                  </TableRow>
                ) : movements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-zinc-500">
                      No stock movements found.
                    </TableCell>
                  </TableRow>
                ) : (
                  movements.map((m) => (
                    <TableRow key={m.id} className="hover:bg-white/5 border-white/5 transition-colors group">
                      <TableCell className="text-zinc-300 font-mono text-xs">
                        {format(new Date(m.createdAt), "MMM d, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-white font-medium group-hover:text-zinc-100">{m.product.name}</span>
                          <span className="text-xs text-zinc-500 font-mono">{m.product.sku}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`font-medium ${getMovementBadge(m.movementType)}`}>
                          <span className="mr-1.5">{getMovementIcon(m.movementType)}</span>
                          {m.movementType.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold ${
                          ["INCOMING", "TRANSFER_IN", "ADJUSTMENT"].includes(m.movementType) 
                          ? "text-emerald-400" : "text-rose-400"
                        }`}>
                          {["INCOMING", "TRANSFER_IN", "ADJUSTMENT"].includes(m.movementType) ? "+" : "-"}{m.quantity}
                          <span className="ml-1 text-[10px] opacity-70">{m.product.unitOfMeasure}</span>
                        </span>
                      </TableCell>
                      <TableCell className="text-zinc-400 text-sm">
                        <div className="flex flex-col">
                          {m.source && <span className="flex items-center gap-1.5"><ArrowUpRight className="w-3 h-3 opacity-50" /> {m.source}</span>}
                          {m.destination && <span className="flex items-center gap-1.5"><ArrowDownLeft className="w-3 h-3 opacity-50" /> {m.destination}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-400 font-mono text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3 h-3 opacity-30" />
                          {m.referenceDocument || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-500 text-xs italic max-w-xs truncate">
                        {m.notes || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
