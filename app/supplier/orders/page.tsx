"use client";

import React, { useState } from "react";
import { useSupplierPortalDashboard } from "@/hooks/queries/use-portal";
import { useAuth } from "@/contexts";
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Calendar,
  ArrowRight,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
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
import { format } from "date-fns";

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">PENDING</Badge>;
    case "processing":
    case "confirmed":
      return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">PROCESSING</Badge>;
    case "shipped":
      return <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800">SHIPPED</Badge>;
    case "delivered":
      return <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">DELIVERED</Badge>;
    case "cancelled":
      return <Badge variant="outline" className="bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800">CANCELLED</Badge>;
    default:
      return <Badge variant="outline">{status.toUpperCase()}</Badge>;
  }
};

export default function SupplierOrdersPage() {
  const { data: dashboard, isLoading } = useSupplierPortalDashboard();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = dashboard?.recentOrders?.filter(order => 
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">My Orders</h1>
          <p className="text-muted-foreground">Manage orders containing your products.</p>
        </div>
        
        <div className="flex items-center gap-2">
           <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search order number..."
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
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
             <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
               <ShoppingCart className="h-6 w-6" />
             </div>
             <p className="text-zinc-500 font-medium">No orders found</p>
             <p className="text-sm text-zinc-400 max-w-xs mx-auto">
               Once customers purchase your products, the orders will appear here.
             </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[150px]">Order Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Your Revenue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="group hover:bg-zinc-500/5 transition-colors">
                    <TableCell className="font-medium font-mono text-zinc-600 dark:text-zinc-300">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell className="text-zinc-500 dark:text-zinc-400 text-sm">
                      {format(new Date(order.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                       <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                        <Package className="h-3 w-3" />
                        {order.productCount} product{order.productCount !== 1 ? 's' : ''}
                       </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      ${order.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="icon" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/orders/${order.id}`}>
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
