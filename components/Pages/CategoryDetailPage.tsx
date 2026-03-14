/**
 * Category Detail Page
 * Displays detailed information about a single category
 */

"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Calendar,
  Tag,
  BarChart3,
  ShoppingCart,
  User,
  Mail,
  CheckCircle2,
  XCircle,
  Edit,
  Copy,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  useCategory,
  useCreateCategory,
  useDeleteCategory,
} from "@/hooks/queries";
import { useBackWithRefresh } from "@/hooks/use-back-with-refresh";
import { useAuth } from "@/contexts";
import Navbar from "@/components/layouts/Navbar";
import { PageContentWrapper } from "@/components/shared";
import { formatDistanceToNow } from "date-fns";
import CategoryDialog from "@/components/category/CategoryDialog";
import { AlertDialogWrapper } from "@/components/dialogs";
import type { Category } from "@/types";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Color variants for glassmorphic cards
 */
type CardVariant =
  | "sky"
  | "emerald"
  | "amber"
  | "rose"
  | "violet"
  | "blue"
  | "orange"
  | "teal";

const variantConfig: Record<
  CardVariant,
  {
    border: string;
    gradient: string;
    shadow: string;
    hoverBorder: string;
    iconBg: string;
  }
> = {
  sky: {
    border: "border-zinc-400/20",
    gradient: "bg-gradient-to-br from-zinc-500/15 via-zinc-500/5 to-transparent",
    shadow:
      "shadow-[0_15px_40px_rgba(0,0,0,0.2)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.2)]",
    hoverBorder: "hover:border-zinc-300/40",
    iconBg: "border-zinc-300/30 bg-zinc-100/50",
  },
  emerald: {
    border: "border-zinc-400/20",
    gradient:
      "bg-gradient-to-br from-zinc-500/15 via-zinc-500/5 to-transparent",
    shadow:
      "shadow-[0_15px_40px_rgba(0,0,0,0.2)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.2)]",
    hoverBorder: "hover:border-zinc-300/40",
    iconBg: "border-zinc-300/30 bg-zinc-100/50",
  },
  amber: {
    border: "border-zinc-400/20",
    gradient:
      "bg-gradient-to-br from-zinc-500/15 via-zinc-500/5 to-transparent",
    shadow:
      "shadow-[0_15px_40px_rgba(0,0,0,0.2)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.2)]",
    hoverBorder: "hover:border-zinc-300/40",
    iconBg: "border-zinc-300/30 bg-zinc-100/50",
  },
  rose: {
    border: "border-zinc-400/20",
    gradient:
      "bg-gradient-to-br from-zinc-500/15 via-zinc-500/5 to-transparent",
    shadow:
      "shadow-[0_15px_40px_rgba(0,0,0,0.2)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.2)]",
    hoverBorder: "hover:border-zinc-300/40",
    iconBg: "border-zinc-300/30 bg-zinc-100/50",
  },
  violet: {
    border: "border-zinc-400/20",
    gradient:
      "bg-gradient-to-br from-zinc-500/15 via-zinc-500/5 to-transparent",
    shadow:
      "shadow-[0_15px_40px_rgba(0,0,0,0.2)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.2)]",
    hoverBorder: "hover:border-zinc-300/40",
    iconBg: "border-zinc-300/30 bg-zinc-100/50",
  },
  blue: {
    border: "border-zinc-400/20",
    gradient:
      "bg-gradient-to-br from-zinc-500/15 via-zinc-500/5 to-transparent",
    shadow:
      "shadow-[0_15px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.1)]",
    hoverBorder: "hover:border-zinc-300/40",
    iconBg: "border-zinc-300/30 bg-zinc-100/50",
  },
  orange: {
    border: "border-zinc-400/20",
    gradient:
      "bg-gradient-to-br from-zinc-500/15 via-zinc-500/5 to-transparent",
    shadow:
      "shadow-[0_15px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.1)]",
    hoverBorder: "hover:border-zinc-300/40",
    iconBg: "border-zinc-300/30 bg-zinc-100/50",
  },
  teal: {
    border: "border-zinc-400/20",
    gradient:
      "bg-gradient-to-br from-zinc-500/15 via-zinc-500/5 to-transparent",
    shadow:
      "shadow-[0_15px_40px_rgba(0,0,0,0.2)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.2)]",
    hoverBorder: "hover:border-zinc-300/40",
    iconBg: "border-zinc-300/30 bg-zinc-100/50",
  },
};

/**
 * Glassmorphic Card component
 */
function GlassCard({
  children,
  variant = "blue",
  className,
}: {
  children: React.ReactNode;
  variant?: CardVariant;
  className?: string;
}) {
  const config = variantConfig[variant];
  return (
    <article
      className={cn(
        "group rounded-[20px] border p-4 sm:p-5 backdrop-blur-sm transition-all duration-300",
        "bg-white/60 dark:bg-white/5",
        config.border,
        config.gradient,
        config.shadow,
        config.hoverBorder,
        className,
      )}
    >
      {children}
    </article>
  );
}

export type CategoryDetailPageProps = { embedInAdmin?: boolean };

export default function CategoryDetailPage({
  embedInAdmin,
}: CategoryDetailPageProps = {}) {
  const params = useParams();
  const router = useRouter();
  const { handleBack } = useBackWithRefresh("category");
  const categoryId = params?.id as string;
  const { user, isCheckingAuth } = useAuth();
  const isMountedRef = useRef(false);
  const [isMounted, setIsMounted] = useState(false);

  const PageWrapper = embedInAdmin ? React.Fragment : Navbar;

  // Fetch category details
  const { data: category, isLoading, isError, error } = useCategory(categoryId);
  const createCategoryMutation = useCreateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isCopying = createCategoryMutation.isPending;
  const isDeleting = deleteCategoryMutation.isPending;
  const isClientRole = user?.role === "client";

  // Edit: open category dialog with current category (same as CategoryActions via onEdit)
  const handleEditCategory = () => {
    if (!category) return;
    setEditingCategory(category as Category);
    setEditDialogOpen(true);
  };

  // Duplicate: create a copy (same as CategoryActions, use mutate + callbacks to avoid unhandled rejection)
  const handleDuplicateCategory = () => {
    if (!category || !user?.id) return;
    createCategoryMutation.mutate(
      {
        name: `${category.name} (copy)`,
        userId: user.id,
        status: category.status ?? true,
        description: category.description ?? undefined,
        notes: category.notes ?? undefined,
      },
      {
        onSuccess: () => {
          router.refresh();
        },
      },
    );
  };

  // Delete: confirm then delete (same pattern as SupplierActions / CategoryActions)
  const handleConfirmDeleteCategory = () => {
    if (!category) return;
    deleteCategoryMutation.mutate(category.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        router.push("/");
      },
      onError: () => {
        setDeleteDialogOpen(false);
      },
    });
  };

  // Mark component as mounted after client-side hydration
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      queueMicrotask(() => setIsMounted(true));
    }
  }, []);

  // Determine loading state - prevents hydration mismatch
  const showSkeleton = !isMounted || isCheckingAuth || isLoading;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isCheckingAuth && !user) {
      router.push("/login");
    }
  }, [user, isCheckingAuth, router]);

  // Show error state
  if (isError) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <GlassCard variant="rose" className="max-w-md text-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Category Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error instanceof Error
                ? error.message
                : "Failed to load category details"}
            </p>
            <Button
              onClick={() => router.push("/")}
              className="rounded-xl border border-gray-300/30 bg-white/50 dark:bg-white/5 dark:border-white/10 hover:bg-gray-100/50 dark:hover:bg-white/10 text-gray-900 dark:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </GlassCard>
        </div>
      </PageWrapper>
    );
  }

  // Show loading skeleton
  if (showSkeleton || !category) {
    return (
      <PageWrapper>
        <PageContentWrapper>
          <div className="max-w-9xl mx-auto space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-white/50 dark:bg-white/5 rounded-xl border border-gray-300/30 dark:border-white/10 animate-pulse" />
              <div className="flex-1">
                <div className="h-8 w-48 bg-white/50 dark:bg-white/5 rounded-lg border border-gray-300/30 dark:border-white/10 animate-pulse" />
                <div className="h-4 w-32 mt-2 bg-white/50 dark:bg-white/5 rounded-lg border border-gray-300/30 dark:border-white/10 animate-pulse" />
              </div>
            </div>

            {/* Status Skeleton */}
            <GlassCard variant="emerald" className="animate-pulse">
              <div className="h-4 w-16 bg-white/50 dark:bg-white/10 rounded mb-3" />
              <div className="h-6 w-24 bg-white/50 dark:bg-white/10 rounded-full" />
            </GlassCard>

            {/* Category Info and Statistics Skeletons */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassCard variant="orange" className="animate-pulse">
                <div className="h-6 w-44 bg-white/50 dark:bg-white/10 rounded mb-4" />
                <div className="space-y-4">
                  <div className="h-4 w-full bg-white/50 dark:bg-white/10 rounded" />
                  <div className="h-4 w-3/4 bg-white/50 dark:bg-white/10 rounded" />
                  <div className="h-4 w-1/2 bg-white/50 dark:bg-white/10 rounded" />
                </div>
              </GlassCard>

              <GlassCard variant="teal" className="animate-pulse">
                <div className="h-6 w-24 bg-white/50 dark:bg-white/10 rounded mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="h-4 w-32 bg-white/50 dark:bg-white/10 rounded" />
                      <div className="h-6 w-20 bg-white/50 dark:bg-white/10 rounded" />
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Products Skeleton */}
            <GlassCard variant="sky" className="animate-pulse">
              <div className="h-6 w-48 bg-white/50 dark:bg-white/10 rounded mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-24 bg-white/50 dark:bg-white/10 rounded-xl"
                  />
                ))}
              </div>
            </GlassCard>

            {/* Action Buttons Skeleton */}
            <div className="flex flex-col sm:flex-row gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-10 w-full sm:w-36 bg-white/50 dark:bg-white/5 rounded-xl border border-gray-300/30 dark:border-white/10 animate-pulse"
                />
              ))}
            </div>
          </div>
        </PageContentWrapper>
      </PageWrapper>
    );
  }

  // Format dates
  const createdAt = new Date(category.createdAt);
  const updatedAt = category.updatedAt ? new Date(category.updatedAt) : null;

  // Category statistics
  const stats = category.statistics || {
    totalProducts: 0,
    totalQuantitySold: 0,
    totalRevenue: 0,
    uniqueOrders: 0,
    totalValue: 0,
  };

  return (
    <PageWrapper>
      <PageContentWrapper>
        <div className="max-w-9xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-10 w-10 rounded-xl border border-gray-300/30 bg-white/50 dark:bg-white/5 dark:border-white/10 hover:bg-gray-100/50 dark:hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {category.name}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Created {formatDistanceToNow(createdAt, { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Category Status Card — same style as supplier detail page */}
          <GlassCard variant="emerald">
            <div className="">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-600 dark:text-white/60 mb-3">
                Status
              </p>
              <Badge
                className={cn(
                  "text-sm border",
                  category.status
                    ? "bg-zinc-500/20 text-zinc-700 dark:text-zinc-300 border-zinc-400/30"
                    : "bg-zinc-500/20 text-zinc-700 dark:text-zinc-300 border-zinc-400/30",
                )}
              >
                {category.status ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3" />
                    Active
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <XCircle className="h-3 w-3" />
                    Inactive
                  </span>
                )}
              </Badge>
            </div>
          </GlassCard>

          {/* Category Information and Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Information */}
            <GlassCard variant="orange">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={cn(
                    "p-2.5 rounded-xl border",
                    variantConfig.orange.iconBg,
                    "dark:border-zinc-400/30 dark:bg-zinc-500/20",
                  )}
                >
                  <Tag className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Category Information
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm p-3 rounded-xl bg-gradient-to-r from-zinc-100/50 via-zinc-50/30 to-transparent dark:from-zinc-500/10 dark:via-zinc-500/5 dark:to-transparent border border-zinc-200/30 dark:border-zinc-400/10">
                  <Tag className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Name:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {category.name}
                  </span>
                </div>

                {category.description && (
                  <div className="p-3 rounded-xl bg-gradient-to-r from-zinc-100/50 via-zinc-50/30 to-transparent dark:from-zinc-500/10 dark:via-zinc-500/5 dark:to-transparent border border-zinc-200/30 dark:border-zinc-400/10">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Description:
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {category.description}
                    </p>
                  </div>
                )}

                {category.notes && (
                  <div className="p-3 rounded-xl bg-gradient-to-r from-zinc-100/50 via-zinc-50/30 to-transparent dark:from-zinc-500/10 dark:via-zinc-500/5 dark:to-transparent border border-zinc-200/30 dark:border-zinc-400/10">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Notes:
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {category.notes}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm p-3 rounded-xl bg-gradient-to-r from-zinc-100/50 via-zinc-50/30 to-transparent dark:from-zinc-500/10 dark:via-zinc-500/5 dark:to-transparent border border-zinc-200/30 dark:border-zinc-400/10">
                  <Calendar className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Created:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {createdAt.toLocaleDateString()}{" "}
                    {createdAt.toLocaleTimeString()}
                  </span>
                </div>

                {updatedAt && (
                  <div className="flex items-center gap-2 text-sm p-3 rounded-xl bg-gradient-to-r from-zinc-100/50 via-zinc-50/30 to-transparent dark:from-zinc-500/10 dark:via-zinc-500/5 dark:to-transparent border border-zinc-200/30 dark:border-zinc-400/10">
                    <Calendar className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Updated:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {updatedAt.toLocaleDateString()}{" "}
                      {updatedAt.toLocaleTimeString()}
                    </span>
                  </div>
                )}

                {/* Creator Information */}
                {category.creator && (
                  <div className="p-3 rounded-xl bg-gradient-to-r from-zinc-100/50 via-zinc-50/30 to-transparent dark:from-zinc-500/10 dark:via-zinc-500/5 dark:to-transparent border border-zinc-200/30 dark:border-zinc-400/10 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Created by:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {category.creator.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Email:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {category.creator.email}
                      </span>
                    </div>
                  </div>
                )}

                {/* Updater Information */}
                {category.updater && (
                  <div className="p-3 rounded-xl bg-gradient-to-r from-zinc-100/50 via-zinc-50/30 to-transparent dark:from-zinc-500/10 dark:via-zinc-500/5 dark:to-transparent border border-zinc-200/30 dark:border-zinc-400/10 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Updated by:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {category.updater.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Email:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {category.updater.email}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Statistics */}
            <GlassCard variant="teal">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={cn(
                    "p-2.5 rounded-xl border",
                    variantConfig.teal.iconBg,
                    "dark:border-zinc-400/30 dark:bg-zinc-500/20",
                  )}
                >
                  <BarChart3 className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Statistics
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Summary of products and sales data
                  </p>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-zinc-100/50 via-zinc-50/30 to-transparent dark:from-zinc-500/10 dark:via-zinc-500/5 dark:to-transparent border border-zinc-200/30 dark:border-zinc-400/10">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total Products:
                  </span>
                  <span className="text-lg font-semibold text-zinc-600 dark:text-zinc-400">
                    {stats.totalProducts}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-zinc-100/50 via-zinc-50/30 to-transparent dark:from-zinc-500/10 dark:via-zinc-500/5 dark:to-transparent border border-zinc-200/30 dark:border-zinc-400/10">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total Quantity Sold:
                  </span>
                  <span className="text-lg font-semibold text-zinc-600 dark:text-zinc-400">
                    {stats.totalQuantitySold}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-zinc-100/50 via-zinc-50/30 to-transparent dark:from-zinc-500/10 dark:via-zinc-500/5 dark:to-transparent border border-zinc-200/30 dark:border-zinc-400/10">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total Revenue:
                  </span>
                  <span className="text-lg font-semibold text-zinc-600 dark:text-zinc-400">
                    ${stats.totalRevenue.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-zinc-100/50 via-zinc-50/30 to-transparent dark:from-zinc-500/10 dark:via-zinc-500/5 dark:to-transparent border border-zinc-200/30 dark:border-zinc-400/10">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Orders Containing Products:
                  </span>
                  <span className="text-lg font-semibold text-zinc-600 dark:text-zinc-400">
                    {stats.uniqueOrders}
                  </span>
                </div>

                <Separator className="my-3 bg-zinc-200/50 dark:bg-zinc-400/20" />

                <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-zinc-100/50 via-zinc-50/30 to-transparent dark:from-zinc-500/10 dark:via-zinc-500/5 dark:to-transparent border border-zinc-200/30 dark:border-zinc-400/10">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Current Stock Value:
                  </span>
                  <span className="text-lg font-semibold text-zinc-600 dark:text-zinc-400">
                    ${stats.totalValue.toFixed(2)}
                  </span>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Products in this Category */}
          {category.products && category.products.length > 0 && (
            <GlassCard variant="sky">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={cn(
                    "p-2.5 rounded-xl border",
                    variantConfig.sky.iconBg,
                    "dark:border-zinc-400/30 dark:bg-zinc-500/20",
                  )}
                >
                  <Package className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Products in this Category
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {category.products.length} product
                    {category.products.length !== 1 ? "s" : ""} in this category
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {category.products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="flex items-center gap-3 p-4 rounded-xl border border-zinc-200/40 dark:border-zinc-400/20 bg-gradient-to-r from-zinc-100/40 via-zinc-50/20 to-transparent dark:from-zinc-500/10 dark:via-zinc-500/5 dark:to-transparent hover:border-zinc-300/60 dark:hover:border-zinc-400/40 hover:from-zinc-100/60 dark:hover:from-zinc-500/20 transition-all duration-300"
                  >
                    {product.imageUrl && (
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white/50 dark:bg-white/5 border border-zinc-200/30 dark:border-zinc-400/20 flex-shrink-0">
                        <Image
                          src={product.imageUrl ?? ""}
                          width={64}
                          height={64}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">
                        {product.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        SKU: {product.sku}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Stock: {product.quantity} • $
                        {(product.price ?? 0).toFixed(2)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Recent Orders */}
          {category.recentOrders && category.recentOrders.length > 0 && (
            <GlassCard variant="violet">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={cn(
                    "p-2.5 rounded-xl border",
                    variantConfig.violet.iconBg,
                    "dark:border-zinc-400/30 dark:bg-zinc-500/20",
                  )}
                >
                  <ShoppingCart className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recent Orders
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Latest orders containing products in this category
                  </p>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                {category.recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.orderId}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-zinc-200/40 dark:border-zinc-400/20 bg-gradient-to-r from-zinc-100/40 via-zinc-50/20 to-transparent dark:from-zinc-500/10 dark:via-zinc-500/5 dark:to-transparent hover:border-zinc-300/60 dark:hover:border-zinc-400/40 hover:from-zinc-100/60 dark:hover:from-zinc-500/20 transition-all duration-300"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Order {order.orderNumber}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Product: {order.productName} (SKU: {order.productSku})
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Quantity: {order.quantity} × ${order.price.toFixed(2)} •
                        Date: {new Date(order.orderDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-left sm:text-right mt-3 sm:mt-0">
                      {/* Sale price style: crossed-out subtotal + actual proportional amount */}
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {typeof order.proportionalAmount === "number" &&
                        order.proportionalAmount !== order.subtotal ? (
                          <>
                            <span className="text-gray-500 dark:text-white/50 line-through mr-2">
                              ${order.subtotal.toFixed(2)}
                            </span>
                            <span className="text-zinc-600 dark:text-zinc-400">
                              ${order.proportionalAmount.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          `$${order.subtotal.toFixed(2)}`
                        )}
                      </p>
                      <Badge
                        className={cn(
                          "text-xs mt-1 border",
                          order.orderStatus === "cancelled" &&
                            "bg-zinc-500/20 text-zinc-700 dark:text-zinc-300 border-zinc-400/30",
                          order.orderStatus === "delivered" &&
                            "bg-zinc-500/20 text-zinc-700 dark:text-zinc-300 border-zinc-400/30",
                          order.orderStatus !== "cancelled" &&
                            order.orderStatus !== "delivered" &&
                            "bg-zinc-500/20 text-zinc-700 dark:text-zinc-300 border-zinc-400/30",
                        )}
                      >
                        {order.orderStatus
                          ? order.orderStatus.charAt(0).toUpperCase() +
                            order.orderStatus.slice(1).toLowerCase()
                          : ""}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Actions — Back, Edit, Duplicate, Delete; responsive (stack on small, row on larger) */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              className="w-full sm:w-auto gap-2 rounded-xl border border-gray-300/30 bg-white/50 dark:bg-white/5 dark:border-white/10 hover:bg-gray-100/50 dark:hover:bg-white/10 text-gray-900 dark:text-white transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              Back
            </Button>
            <Button
              onClick={handleEditCategory}
              disabled={isClientRole}
              className="w-full sm:w-auto gap-2 rounded-xl border border-zinc-400/30 bg-gradient-to-r from-zinc-500/70 via-zinc-500/50 to-zinc-500/30 text-white shadow-[0_10px_25px_rgba(0,0,0,0.35)] backdrop-blur-sm hover:border-zinc-300/50 hover:from-zinc-500/80 hover:via-zinc-500/60 hover:to-zinc-500/40 transition-all duration-300 disabled:opacity-50"
            >
              <Edit className="h-4 w-4 shrink-0" />
              Edit Category
            </Button>
            <Button
              onClick={handleDuplicateCategory}
              disabled={isCopying || isClientRole}
              className="w-full sm:w-auto gap-2 rounded-xl border border-zinc-400/30 bg-gradient-to-r from-zinc-500/70 via-zinc-500/50 to-zinc-500/30 text-white shadow-[0_10px_25px_rgba(0,0,0,0.2)] backdrop-blur-sm hover:border-zinc-300/50 hover:from-zinc-500/80 hover:via-zinc-500/60 hover:to-zinc-500/40 transition-all duration-300 disabled:opacity-50"
            >
              <Copy className="h-4 w-4 shrink-0" />
              {isCopying ? "Duplicating..." : "Create Duplicate"}
            </Button>
            <Button
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isDeleting || isClientRole}
              className="w-full sm:w-auto gap-2 rounded-xl border border-zinc-400/30 bg-gradient-to-r from-zinc-500/70 via-zinc-500/50 to-zinc-500/30 text-white shadow-[0_10px_25px_rgba(0,0,0,0.2)] backdrop-blur-sm hover:border-zinc-300/50 hover:from-zinc-500/80 hover:via-zinc-500/60 hover:to-zinc-500/40 transition-all duration-300 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4 shrink-0" />
              {isDeleting ? "Deleting..." : "Delete Category"}
            </Button>
          </div>

          {/* Delete confirmation — same pattern as CategoryActions */}
          <AlertDialogWrapper
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            title="Are you absolutely sure?"
            description={`This action cannot be undone. This will permanently delete the category "${category.name}".`}
            actionLabel="Delete"
            actionLoadingLabel="Deleting..."
            isLoading={isDeleting}
            onAction={handleConfirmDeleteCategory}
            onCancel={() => setDeleteDialogOpen(false)}
            actionVariant="destructive"
          />

          {/* Edit dialog — opened by "Edit Category"; toasts from mutation hooks */}
          <CategoryDialog
            open={editDialogOpen}
            onOpenChange={(open) => {
              setEditDialogOpen(open);
              if (!open) setEditingCategory(null);
            }}
            editingCategory={editingCategory}
            onEditCategory={(c) => setEditingCategory(c)}
          >
            <div style={{ display: "none" }} aria-hidden />
          </CategoryDialog>
        </div>
      </PageContentWrapper>
    </PageWrapper>
  );
}

