"use client";

import React, { useState } from "react";
import { useProducts } from "@/hooks/queries";
import { useAuth } from "@/contexts";
import { 
  Package, 
  Search, 
  ArrowRight,
  Plus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Layers,
  DollarSign
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
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function SupplierProductsPage() {
  const { data: products, isLoading } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">My Products</h1>
          <p className="text-muted-foreground">Monitor your product catalog and stock levels.</p>
        </div>
        
        <div className="flex items-center gap-2">
           <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or SKU..."
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
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
             <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
               <Package className="h-6 w-6" />
             </div>
             <p className="text-zinc-500 font-medium">No products found</p>
             <p className="text-sm text-zinc-400 max-w-xs mx-auto">
               Your products will appear here once they are added by the administrator.
             </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Product</TableHead>
                  <TableHead>Stock Status</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Qty Available</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} className="group hover:bg-zinc-500/5 transition-colors">
                    <TableCell>
                      <div>
                        <Link href={`/products/${product.id}`} className="font-medium text-zinc-800 dark:text-zinc-200 hover:text-emerald-600 transition-colors">
                          {product.name}
                        </Link>
                        <p className="text-xs text-zinc-500 font-mono">{product.sku}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                       {product.quantity <= 0 ? (
                         <Badge variant="outline" className="bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800 gap-1">
                           <XCircle className="h-3 w-3" /> OUT OF STOCK
                         </Badge>
                       ) : product.quantity <= 20 ? (
                         <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 gap-1">
                           <AlertTriangle className="h-3 w-3" /> LOW STOCK
                         </Badge>
                       ) : (
                         <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 gap-1">
                           <CheckCircle className="h-3 w-3" /> AVAILABLE
                         </Badge>
                       )}
                    </TableCell>
                    <TableCell className="text-right font-medium text-zinc-700 dark:text-zinc-300">
                      ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                       <span className={cn(
                         "inline-block px-2 py-0.5 rounded-lg",
                         product.quantity <= 0 ? "text-rose-600 bg-rose-50 dark:bg-rose-950/20" : 
                         product.quantity <= 20 ? "text-amber-600 bg-amber-50 dark:bg-amber-950/20" : 
                         "text-zinc-600 dark:text-zinc-400"
                       )}>
                        {product.quantity}
                       </span>
                    </TableCell>
                    <TableCell>
                       <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        {typeof product.category === 'string' ? product.category : (product.category?.name || "Uncategorized")}
                       </span>
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="icon" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/products/${product.id}`}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </article>
    </div>
  );
}
