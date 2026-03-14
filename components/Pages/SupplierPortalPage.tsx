"use client";

/**
 * Supplier Portal Page
 * Dashboard for suppliers to view their products, orders, and revenue
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useSupplierPortalDashboard } from "@/hooks/queries";
import { useAuth } from "@/contexts";
import {
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Clock,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ResponsiveChartContainer } from "@/components/ui/responsive-chart-container";
import Navbar from "@/components/layouts/Navbar";
import { PageContentWrapper } from "@/components/shared";
import { StatisticsCard } from "@/components/home/StatisticsCard";
import { StatisticsCardSkeleton } from "@/components/home/StatisticsCardSkeleton";
import { cn } from "@/lib/utils";

/**
 * Get order status badge with distinct colors (matches order table/detail)
 */
function getStatusBadge(status: string) {
  const statusStyles: Record<string, string> = {
    pending:
      "bg-primary/5 text-primary/80 border-primary/20",
    confirmed:
      "bg-primary/5 text-primary/80 border-primary/20",
    processing:
      "bg-primary/5 text-primary/80 border-primary/20",
    shipped:
      "bg-primary/5 text-primary/80 border-primary/20",
    delivered:
      "bg-primary/5 text-primary/80 border-primary/20",
    cancelled:
      "bg-muted text-muted-foreground border-muted",
  };
  const className =
    statusStyles[status] ??
    "bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300 border-gray-300/30";
  return (
    <Badge variant="outline" className={className}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export default function SupplierPortalPage() {
  const [mounted, setMounted] = useState(false);
  const { isCheckingAuth } = useAuth();
  const { data: dashboard, isLoading, isError } = useSupplierPortalDashboard();

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  // Same initial output on server and client to avoid hydration mismatch (React Query state can differ)
  if (!mounted) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64 rounded-md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <StatisticsCardSkeleton key={i} />
          ))}
        </div>
        <Skeleton className="h-64 rounded-md" />
      </div>
    );
  }

  // Show skeleton while auth is resolving or portal data is loading (avoids "Failed to load" on refresh)
  if (isCheckingAuth || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64 rounded-md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <StatisticsCardSkeleton key={i} />
          ))}
        </div>
        <Skeleton className="h-64 rounded-md" />
      </div>
    );
  }

  if (isError || !dashboard) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-primary">
          Supplier Portal
        </h1>
        <article
          className={cn(
            "rounded-[28px] border border-white/10 dark:border-white/20 p-4 sm:p-6 backdrop-blur-sm bg-white/60 dark:bg-white/5 shadow-[0_15px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_30px_80px_rgba(255,255,255,0.08)]",
          )}
        >
          <p className="text-muted-foreground text-center">
            {isError
              ? "Failed to load supplier dashboard. Please ensure your account is linked to a supplier entity."
              : "No supplier data available."}
          </p>
          <div className="flex justify-center mt-4">
            <Button asChild variant="outline">
              <Link href="/">Go to Dashboard</Link>
            </Button>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
          Supplier Portal
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Welcome, {dashboard?.supplierName}
        </p>
      </div>

      {/* Summary Cards — supplier's products/orders/revenue only */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatisticsCard
          title="Total Products"
          value={dashboard?.totalProducts ?? 0}
          description="Products in your catalog"
          icon={Package}
          badges={[
            {
              label: "Available",
              value:
                dashboard?.productStatusCounts?.available ??
                (dashboard ? dashboard.totalProducts - (dashboard.lowStockProducts?.length ?? 0) : 0),
            },
            {
              label: "Stock low",
              value:
                dashboard?.productStatusCounts?.stockLow ??
                (dashboard?.lowStockProducts?.length ?? 0),
            },
            {
              label: "Stock out",
              value: dashboard?.productStatusCounts?.stockOut ?? 0,
            },
            {
              label: "Product value",
              value: `$${(dashboard?.productValue ?? 0).toLocaleString(
                undefined,
                { minimumFractionDigits: 2, maximumFractionDigits: 2 },
              )}`,
            },
          ]}
        />
        <StatisticsCard
          title="Total Orders"
          value={dashboard?.totalOrders ?? 0}
          description="Orders containing your products"
          icon={ShoppingCart}
          badges={[
            {
              label: "Pending",
              value: dashboard?.orderStatusCounts?.pending ?? 0,
            },
            {
              label: "In progress",
              value: dashboard?.orderStatusCounts?.inProgress ?? 0,
            },
            {
              label: "Shipped",
              value: dashboard?.orderStatusCounts?.shipped ?? 0,
            },
            {
              label: "Delivered",
              value: dashboard?.orderStatusCounts?.delivered ?? 0,
            },
            {
              label: "Refunded",
              value: dashboard?.orderStatusCounts?.refunded ?? 0,
            },
            {
              label: "Cancelled",
              value: dashboard?.orderStatusCounts?.cancelled ?? 0,
            },
          ]}
        />
        <StatisticsCard
          title="Pending Orders"
          value={dashboard?.pendingOrders ?? 0}
          description="Orders awaiting action"
          icon={Clock}
          badges={[
            {
              label: "Cancelled",
              value: dashboard?.orderStatusCounts?.cancelled ?? 0,
            },
            {
              label: "Completed",
              value: dashboard?.orderStatusCounts?.completed ?? 0,
            },
            {
              label: "Refunded",
              value: dashboard?.orderStatusCounts?.refunded ?? 0,
            },
            { label: "Of Total", value: dashboard?.totalOrders ?? 0 },
          ]}
        />
        <StatisticsCard
          title="Total Revenue"
          value={`$${(dashboard?.totalRevenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          description="Revenue from your products (excl. cancelled)"
          icon={DollarSign}
          badges={[
            {
              label: "Paid",
              value: `$${(
                dashboard?.revenueBreakdown?.paid ?? (dashboard?.paidRevenue ?? 0)
              ).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`,
            },
            {
              label: "Due",
              value: `$${(
                dashboard?.revenueBreakdown?.due ?? 0
              ).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`,
            },
            {
              label: "Refund",
              value: `$${(
                dashboard?.revenueBreakdown?.refund ?? 0
              ).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`,
            },
            {
              label: "Pending",
              value: `$${(
                dashboard?.revenueBreakdown?.pending ??
                (dashboard?.unpaidRevenue ?? 0)
              ).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`,
            },
            ...(dashboard && dashboard.totalOrders > 0
              ? [
                {
                  label: "Avg/Order",
                  value: `$${(
                    dashboard.totalRevenue /
                    Math.max(
                      1,
                      dashboard.totalOrders -
                      (dashboard.orderStatusCounts?.cancelled ?? 0),
                    )
                  ).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`,
                },
              ]
              : []),
          ]}
        />
      </div>

      {/* Revenue Chart — glassmorphic card */}
      {dashboard?.monthlyRevenue && dashboard.monthlyRevenue.length > 0 && (
        <article
          className={cn(
            "rounded-[28px] border border-primary/20 p-4 sm:p-6 backdrop-blur-sm transition-all",
            "bg-white/60 dark:bg-white/5",
            "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-white/10 dark:via-white/5 dark:to-white/2",
            "shadow-[0_15px_40px_rgba(26,22,20,0.08)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.3)]",
            "hover:border-primary/40",
          )}
        >
          <div className="mb-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <TrendingUp className="h-5 w-5 text-primary/60" />
              Monthly Revenue
            </h3>
            <p className="text-sm text-gray-600 dark:text-white/70 mt-1">
              Revenue from your products over the last 6 months (grouped by
              month)
            </p>
          </div>
          <ResponsiveChartContainer>
            <AreaChart
              data={dashboard.monthlyRevenue}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value) => [
                  `$${Number(value).toLocaleString()}`,
                  "Revenue",
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary) / 0.1)"
              />
            </AreaChart>
          </ResponsiveChartContainer>
        </article>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders — glassmorphic */}
        <article
          className={cn(
            "rounded-[28px] border border-primary/20 p-4 sm:p-6 backdrop-blur-sm transition-all",
            "bg-white/60 dark:bg-white/5",
            "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-white/10 dark:via-white/5 dark:to-white/2",
            "shadow-[0_15px_40px_rgba(26,22,20,0.08)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.3)]",
            "hover:border-primary/40",
          )}
        >
          <div className="mb-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <ShoppingCart className="h-5 w-5 text-primary/60" />
              Recent Orders
            </h3>
            <p className="text-sm text-gray-600 dark:text-white/70 mt-1">
              Orders containing your products
            </p>
          </div>
          <div>
            {!dashboard || dashboard.recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No orders yet
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboard.recentOrders.slice(0, 5).map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <Link
                            href={`/orders/${order.id}`}
                            className="text-primary hover:text-primary/80 transition-colors"
                          >
                            {order.orderNumber}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right">
                          ${order.total.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(order.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </article>

        {/* Low Stock Products — glassmorphic */}
        <article
          id="products"
          className={cn(
            "rounded-[28px] border border-primary/20 p-4 sm:p-6 backdrop-blur-sm transition-all",
            "bg-white/60 dark:bg-white/5",
            "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-white/10 dark:via-white/5 dark:to-white/2",
            "shadow-[0_15px_40px_rgba(26,22,20,0.08)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.3)]",
            "hover:border-primary/40",
          )}
        >
          <div className="mb-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-primary">
              <AlertTriangle className="h-5 w-5 text-primary/60" />
              Low Stock Products
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Products with 20 or fewer available units (same threshold as
              product owner)
            </p>
          </div>
          <div>
            {!dashboard || dashboard.lowStockProducts.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                All products have sufficient stock
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">
                        Available
                      </TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboard.lowStockProducts
                      .slice(0, 5)
                      .map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <Link
                              href={`/products/${product.id}`}
                              className="text-primary hover:text-primary/80 transition-colors"
                            >
                              {product.name}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {product.sku}
                            </p>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-primary/70">
                            {product.quantity}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                product.quantity === 0
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {product.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </article>
      </div>

      {/* Quick Links — glassmorphic */}
      <article
        className={cn(
          "rounded-[28px] border border-primary/20 p-4 sm:p-6 backdrop-blur-sm transition-all",
          "bg-white/60 dark:bg-white/5",
          "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-white/10 dark:via-white/5 dark:to-white/2",
          "shadow-[0_15px_40px_rgba(26,22,20,0.08)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.3)]",
          "hover:border-primary/40",
        )}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Links
        </h3>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/products">
              <Package className="h-4 w-4" />
              View Products
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/orders">
              <ShoppingCart className="h-4 w-4" />
              View Orders
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/">
              <TrendingUp className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </div>
      </article>
    </div>
  );
}

