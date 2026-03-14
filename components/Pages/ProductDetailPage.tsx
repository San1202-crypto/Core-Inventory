/**
 * Product Detail Page
 * Displays detailed information about a single product
 */

"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Package,
  Calendar,
  Tag,
  Truck,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  BarChart3,
  QrCode,
  Image as ImageIcon,
  User,
  Mail,
  Edit,
  Copy,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  useProduct,
  useCreateProduct,
  useDeleteProduct,
  useProducts,
} from "@/hooks/queries";
import { useBackWithRefresh } from "@/hooks/use-back-with-refresh";
import { useAuth } from "@/contexts";
import { useProductStore } from "@/stores";
import Navbar from "@/components/layouts/Navbar";
import { PageContentWrapper } from "@/components/shared";
import { formatDistanceToNow } from "date-fns";
import type { Product, ProductStatus } from "@/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import ProductFormDialog from "@/components/products/ProductFormDialog";
import { AlertDialogWrapper } from "@/components/dialogs";
import ProductReviewsSection from "@/components/product-reviews/ProductReviewsSection";

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
    border: "border-primary/20",
    gradient: "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-white/10 dark:via-white/5 dark:to-white/2",
    shadow: "shadow-[0_15px_40px_rgba(26,22,20,0.08)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.3)]",
    hoverBorder: "hover:border-primary/40",
    iconBg: "border-primary/20 bg-primary/5",
  },
  emerald: {
    border: "border-primary/20",
    gradient: "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-white/10 dark:via-white/5 dark:to-white/2",
    shadow: "shadow-[0_15px_40px_rgba(26,22,20,0.08)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.3)]",
    hoverBorder: "hover:border-primary/40",
    iconBg: "border-primary/20 bg-primary/5",
  },
  amber: {
    border: "border-primary/25",
    gradient: "bg-gradient-to-br from-primary/12 via-primary/6 to-transparent dark:from-white/12 dark:via-white/6 dark:to-white/3",
    shadow: "shadow-[0_15px_45px_rgba(26,22,20,0.12)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.4)]",
    hoverBorder: "hover:border-primary/45",
    iconBg: "border-primary/25 bg-primary/8",
  },
  rose: {
    border: "border-primary/20",
    gradient: "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-white/10 dark:via-white/5 dark:to-white/2",
    shadow: "shadow-[0_15px_40px_rgba(26,22,20,0.08)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.3)]",
    hoverBorder: "hover:border-primary/40",
    iconBg: "border-primary/20 bg-primary/5",
  },
  violet: {
    border: "border-primary/20",
    gradient: "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-white/10 dark:via-white/5 dark:to-white/2",
    shadow: "shadow-[0_15px_40px_rgba(26,22,20,0.08)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.3)]",
    hoverBorder: "hover:border-primary/40",
    iconBg: "border-primary/20 bg-primary/5",
  },
  blue: {
    border: "border-primary/20",
    gradient: "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-white/10 dark:via-white/5 dark:to-white/2",
    shadow: "shadow-[0_15px_40px_rgba(26,22,20,0.08)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.3)]",
    hoverBorder: "hover:border-primary/40",
    iconBg: "border-primary/20 bg-primary/5",
  },
  orange: {
    border: "border-primary/20",
    gradient: "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-white/10 dark:via-white/5 dark:to-white/2",
    shadow: "shadow-[0_15px_40px_rgba(26,22,20,0.08)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.3)]",
    hoverBorder: "hover:border-primary/40",
    iconBg: "border-primary/20 bg-primary/5",
  },
  teal: {
    border: "border-primary/20",
    gradient: "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-white/10 dark:via-white/5 dark:to-white/2",
    shadow: "shadow-[0_15px_40px_rgba(26,22,20,0.08)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.3)]",
    hoverBorder: "hover:border-primary/40",
    iconBg: "border-primary/20 bg-primary/5",
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
        "rounded-[20px] border backdrop-blur-sm transition overflow-hidden",
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

/**
 * Get status badge variant based on product status
 */
function getStatusBadgeVariant(
  status?: ProductStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "Available":
      return "default";
    case "Stock Low":
      return "secondary";
    case "Stock Out":
      return "destructive";
    default:
      return "outline";
  }
}

export type ProductDetailPageProps = { embedInAdmin?: boolean };

export default function ProductDetailPage({
  embedInAdmin,
}: ProductDetailPageProps = {}) {
  const params = useParams();
  const router = useRouter();
  const { handleBack } = useBackWithRefresh("product");
  const productId = params?.id as string;
  const { user, isCheckingAuth } = useAuth();
  const isMountedRef = useRef(false);
  const [isMounted, setIsMounted] = useState(false);

  const PageWrapper = embedInAdmin ? React.Fragment : Navbar;

  // Fetch product details
  const { data: product, isLoading, isError, error } = useProduct(productId);
  const { data: allProducts = [] } = useProducts();
  const { setSelectedProduct, setOpenProductDialog } = useProductStore();
  const createProductMutation = useCreateProduct();
  const deleteProductMutation = useDeleteProduct();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isCopying = createProductMutation.isPending;
  const isDeleting = deleteProductMutation.isPending;
  const isSupplierRole = user?.role === "supplier";
  const isClientRole = user?.role === "client";
  const disableCrud = isSupplierRole || isClientRole;

  // Edit: open product form dialog with current product (same as ProductActions)
  const handleEditProduct = () => {
    if (!product) return;
    const productForForm: Product = {
      ...product,
      category:
        typeof product.category === "object"
          ? (product.category as { name?: string })?.name
          : (product as { category?: string }).category,
      supplier:
        typeof product.supplier === "object"
          ? (product.supplier as { name?: string })?.name
          : (product as { supplier?: string }).supplier,
    };
    setSelectedProduct(productForForm);
    setOpenProductDialog(true);
  };

  // Duplicate: create a copy (same as ProductActions, use mutate + callbacks to avoid unhandled rejection)
  const handleDuplicateProduct = () => {
    if (!product) return;
    const uniqueSku = `${product.sku}-${Date.now()}`;
    createProductMutation.mutate(
      {
        name: `${product.name} (copy)`,
        sku: uniqueSku,
        price: product.price,
        quantity: product.quantity,
        status: (product.status as ProductStatus) || "Available",
        categoryId: product.categoryId,
        supplierId: product.supplierId,
        userId: product.userId,
      },
      {
        onSuccess: () => {
          router.refresh();
        },
      },
    );
  };

  // Delete: confirm then delete (same as ProductActions)
  const handleConfirmDeleteProduct = () => {
    if (!product) return;
    deleteProductMutation.mutate(product.id, {
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
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Product Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error instanceof Error
                ? error.message
                : "Failed to load product details"}
            </p>
            <Button onClick={() => router.push("/")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // Show loading skeleton
  if (showSkeleton || !product) {
    return (
      <PageWrapper>
        <PageContentWrapper>
          <div className="max-w-9xl mx-auto space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-gray-200/50 dark:bg-white/10 rounded-xl animate-pulse" />
              <div className="h-8 w-48 bg-gray-200/50 dark:bg-white/10 rounded-xl animate-pulse" />
            </div>

            {/* Product Image & QR Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard variant="sky">
                <div className="p-4 sm:p-5">
                  <div className="h-6 w-32 bg-gray-200/50 dark:bg-white/10 rounded-lg animate-pulse mb-4" />
                  <div className="h-64 w-full bg-gray-200/50 dark:bg-white/10 rounded-xl animate-pulse" />
                </div>
              </GlassCard>
              <GlassCard variant="violet">
                <div className="p-4 sm:p-5">
                  <div className="h-6 w-32 bg-gray-200/50 dark:bg-white/10 rounded-lg animate-pulse mb-4" />
                  <div className="h-64 w-full bg-gray-200/50 dark:bg-white/10 rounded-xl animate-pulse" />
                </div>
              </GlassCard>
            </div>

            {/* Status Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["emerald", "amber", "blue"] as CardVariant[]).map(
                (variant) => (
                  <GlassCard key={variant} variant={variant}>
                    <div className="p-4 sm:p-5">
                      <div className="h-4 w-20 bg-gray-200/50 dark:bg-white/10 rounded animate-pulse mb-3" />
                      <div className="h-8 w-32 bg-gray-200/50 dark:bg-white/10 rounded-xl animate-pulse" />
                    </div>
                  </GlassCard>
                ),
              )}
            </div>

            {/* Info and Statistics Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassCard variant="teal">
                <div className="p-4 sm:p-5 space-y-4">
                  <div className="h-6 w-40 bg-gray-200/50 dark:bg-white/10 rounded-lg animate-pulse" />
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-4 w-full bg-gray-200/50 dark:bg-white/10 rounded animate-pulse"
                    />
                  ))}
                </div>
              </GlassCard>
              <GlassCard variant="orange">
                <div className="p-4 sm:p-5 space-y-4">
                  <div className="h-6 w-40 bg-gray-200/50 dark:bg-white/10 rounded-lg animate-pulse" />
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-12 w-full bg-gray-200/50 dark:bg-white/10 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>
        </PageContentWrapper>
      </PageWrapper>
    );
  }

  // Format dates
  const createdAt = new Date(product.createdAt);
  const updatedAt = product.updatedAt ? new Date(product.updatedAt) : null;
  const expirationDate = product.expirationDate
    ? new Date(product.expirationDate)
    : null;

  // Product statistics
  const stats = product.statistics || {
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
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white truncate">
                {product.name}
              </h1>
              <p className="text-sm text-gray-600 dark:text-white/60 mt-1">
                SKU: {product.sku} • Created{" "}
                {formatDistanceToNow(createdAt, { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Product Image and QR Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Image */}
            <GlassCard variant="sky">
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/5">
                    <ImageIcon className="h-4 w-4 text-primary/70" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Product Image
                  </h3>
                </div>
                {product.imageUrl ? (
                  <div className="relative w-full h-64 rounded-xl overflow-hidden bg-white/50 dark:bg-white/5 border border-gray-300/20 dark:border-white/10">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                ) : (
                  <div className="w-full h-64 rounded-xl bg-white/30 dark:bg-white/5 border border-gray-300/20 dark:border-white/10 flex items-center justify-center">
                    <p className="text-gray-500 dark:text-white/50">
                      No image available
                    </p>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* QR Code / Barcode */}
            <GlassCard variant="violet">
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/5">
                    <QrCode className="h-4 w-4 text-primary/70" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    QR Code / Barcode
                  </h3>
                </div>
                {product.qrCodeUrl ? (
                  <div className="relative w-full h-64 rounded-xl overflow-hidden bg-white border border-gray-300/20 dark:border-white/10">
                    <Image
                      src={product.qrCodeUrl}
                      alt={`QR Code for ${product.sku}`}
                      fill
                      className="object-contain p-4"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                ) : (
                  <div className="w-full h-64 rounded-xl bg-white/30 dark:bg-white/5 border border-gray-300/20 dark:border-white/10 flex items-center justify-center">
                    <p className="text-gray-500 dark:text-white/50">
                      No QR code available
                    </p>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Product Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GlassCard variant="emerald">
              <div className="p-4 sm:p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-600 dark:text-white/60 mb-3">
                  Status
                </p>
                <Badge
                  className="text-sm border bg-primary/5 text-primary/80 dark:text-primary/90 border-primary/20"
                >
                  {product.status || "N/A"}
                </Badge>
              </div>
            </GlassCard>

            <GlassCard variant="amber">
              <div className="p-4 sm:p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-600 dark:text-white/60 mb-3">
                  Stock
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {product.quantity - (product.reservedQuantity ?? 0)}
                  <span className="text-sm font-normal text-gray-600 dark:text-white/60 ml-1">
                    available
                  </span>
                </p>
                {(product.reservedQuantity ?? 0) > 0 && (
                  <p className="text-sm text-gray-600 dark:text-white/60 mt-1">
                    {product.reservedQuantity} reserved · {product.quantity}{" "}
                    total
                  </p>
                )}
              </div>
            </GlassCard>

            <GlassCard variant="blue">
              <div className="p-4 sm:p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-600 dark:text-white/60 mb-3">
                  Price
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            </GlassCard>
          </div>

          {/* Product Information and Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Information */}
            <GlassCard variant="teal">
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/5">
                    <Package className="h-4 w-4 text-primary/70" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Product Information
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Tag className="h-4 w-4 text-gray-500 dark:text-white/50" />
                    <span className="text-gray-600 dark:text-white/60">
                      SKU:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {product.sku}
                    </span>
                  </div>

                  {product.category && typeof product.category === "object" && (
                    <div className="flex items-center gap-2 text-sm">
                      <Tag className="h-4 w-4 text-gray-500 dark:text-white/50" />
                      <span className="text-gray-600 dark:text-white/60">
                        Category:
                      </span>
                      <Link
                        href={
                          embedInAdmin
                            ? `/admin/categories/${product.category.id}`
                            : `/categories/${product.category.id}`
                        }
                        className="font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300"
                      >
                        {product.category.name}
                      </Link>
                    </div>
                  )}

                  {product.supplier && typeof product.supplier === "object" && (
                    <div className="flex items-center gap-2 text-sm">
                      <Truck className="h-4 w-4 text-gray-500 dark:text-white/50" />
                      <span className="text-gray-600 dark:text-white/60">
                        Supplier:
                      </span>
                      <Link
                        href={
                          embedInAdmin
                            ? `/admin/suppliers/${product.supplier.id}`
                            : `/suppliers/${product.supplier.id}`
                        }
                        className="font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300"
                      >
                        {product.supplier.name}
                      </Link>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500 dark:text-white/50" />
                    <span className="text-gray-600 dark:text-white/60">
                      Created:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {createdAt.toLocaleDateString()}{" "}
                      {createdAt.toLocaleTimeString()}
                    </span>
                  </div>

                  {updatedAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500 dark:text-white/50" />
                      <span className="text-gray-600 dark:text-white/60">
                        Updated:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {updatedAt.toLocaleDateString()}{" "}
                        {updatedAt.toLocaleTimeString()}
                      </span>
                    </div>
                  )}

                  {expirationDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500 dark:text-white/50" />
                      <span className="text-gray-600 dark:text-white/60">
                        Expiration Date:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {expirationDate.toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {/* Creator Information */}
                  {product.creator && (
                    <div className="pt-3 mt-3 border-t border-primary/10">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-gray-500 dark:text-white/50" />
                        <span className="text-gray-600 dark:text-white/60">
                          Created by:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {product.creator.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm mt-1">
                        <Mail className="h-4 w-4 text-gray-500 dark:text-white/50" />
                        <span className="text-gray-600 dark:text-white/60">
                          Email:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {product.creator.email}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Updater Information */}
                  {product.updater && (
                    <div className="pt-3 mt-3 border-t border-primary/10">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-gray-500 dark:text-white/50" />
                        <span className="text-gray-600 dark:text-white/60">
                          Updated by:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {product.updater.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm mt-1">
                        <Mail className="h-4 w-4 text-gray-500 dark:text-white/50" />
                        <span className="text-gray-600 dark:text-white/60">
                          Email:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {product.updater.email}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>

            {/* Sales Statistics */}
            <GlassCard variant="orange">
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/5">
                    <BarChart3 className="h-4 w-4 text-primary/70" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Sales Statistics
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-white/60">
                      Summary of sales and inventory data
                    </p>
                  </div>
                </div>
                <div className="space-y-4 mt-4">
                  <div className="flex justify-between items-center p-3 rounded-xl border border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
                    <span className="text-sm text-gray-600 dark:text-white/70">
                      Total Quantity Sold:
                    </span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {stats.totalQuantitySold}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-xl border border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
                    <span className="text-sm text-gray-600 dark:text-white/70">
                      Total Revenue:
                    </span>
                    <span className="text-lg font-semibold text-zinc-600 dark:text-zinc-400">
                      ${stats.totalRevenue.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-xl border border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
                    <span className="text-sm text-gray-600 dark:text-white/70">
                      Orders Containing This Product:
                    </span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {stats.uniqueOrders}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-xl border border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
                    <span className="text-sm text-gray-600 dark:text-white/70">
                      Current Stock Value:
                    </span>
                    <span className="text-lg font-semibold text-zinc-600 dark:text-zinc-400">
                      ${(stats.totalValue ?? 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Recent Orders */}
          {product.recentOrders && product.recentOrders.length > 0 && (
            <GlassCard variant="rose">
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/5">
                    <ShoppingCart className="h-4 w-4 text-primary/70" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Recent Orders
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-white/60">
                      Latest orders containing this product
                    </p>
                  </div>
                </div>
                <div className="space-y-3 mt-4">
                  {product.recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={
                        embedInAdmin
                          ? `/admin/orders/${order.orderId}`
                          : `/orders/${order.orderId}`
                      }
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-300/20 dark:border-white/10 bg-white/30 dark:bg-white/5 hover:bg-white/50 dark:hover:bg-white/10 backdrop-blur-sm transition-colors gap-3"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Order {order.orderNumber}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-white/60 mt-1">
                          Quantity: {order.quantity} × ${order.price.toFixed(2)}{" "}
                          • Date:{" "}
                          {new Date(order.orderDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
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
              </div>
            </GlassCard>
          )}

          {/* Product Reviews */}
          <ProductReviewsSection
            productId={product.id}
            productName={product.name}
            variant="amber"
          />

          {/* Actions — Back, Edit, Duplicate, Delete; responsive (stack on small, row on larger) */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              className="w-full sm:w-auto gap-2 rounded-xl border-gray-400/30 bg-white/50 dark:bg-white/5 hover:bg-gray-100/50 dark:hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              Back
            </Button>
            <Button
              variant="outline"
              onClick={handleEditProduct}
              disabled={disableCrud}
              className="w-full sm:w-auto gap-2 rounded-xl border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent hover:from-primary/15 shadow-[0_5px_20px_rgba(26,22,20,0.05)]"
            >
              <Edit className="h-4 w-4 shrink-0" />
              Edit Product
            </Button>
            <Button
              variant="outline"
              onClick={handleDuplicateProduct}
              disabled={isCopying || disableCrud}
              className="w-full sm:w-auto gap-2 rounded-xl border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent hover:from-primary/15 shadow-[0_5px_20px_rgba(26,22,20,0.1)]"
            >
              <Copy className="h-4 w-4 shrink-0" />
              {isCopying ? "Duplicating..." : "Create Duplicate"}
            </Button>
            <Button
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isDeleting || disableCrud}
              className="w-full sm:w-auto gap-2 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent text-primary/80 hover:from-primary/15 shadow-[0_5px_20px_rgba(26,22,20,0.1)]"
            >
              <Trash2 className="h-4 w-4 shrink-0" />
              {isDeleting ? "Deleting..." : "Delete Product"}
            </Button>
          </div>

          {/* Delete confirmation — same pattern as ProductActions */}
          <AlertDialogWrapper
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            title="Delete Product"
            description={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
            actionLabel="Delete"
            actionLoadingLabel="Deleting..."
            isLoading={isDeleting}
            onAction={handleConfirmDeleteProduct}
            onCancel={() => setDeleteDialogOpen(false)}
          />

          {/* Edit dialog — opened by "Edit Product"; toasts from mutation hooks */}
          <ProductFormDialog allProducts={allProducts} userId={user?.id ?? ""}>
            <div style={{ display: "none" }} aria-hidden />
          </ProductFormDialog>
        </div>
      </PageContentWrapper>
    </PageWrapper>
  );
}

