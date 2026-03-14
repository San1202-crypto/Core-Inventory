/**
 * Statistics Card Skeleton Component
 * Skeleton loader that matches exact dimensions of StatisticsCard
 * Used during data fetching to prevent layout shift
 */

import React from "react";
import { cn } from "@/lib/utils";

/**
 * Props for StatisticsCardSkeleton component
 */
interface StatisticsCardSkeletonProps {
  /**
   * Optional className for additional styling
   */
  className?: string;
}

/**
 * StatisticsCardSkeleton component
 * Displays a skeleton loader matching StatisticsCard structure and dimensions
 */
export function StatisticsCardSkeleton({
  className,
}: StatisticsCardSkeletonProps) {
  return (
    <article
      className={cn(
        "group rounded-[28px] border border-primary/10 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent dark:from-white/10 dark:via-white/5 dark:to-white/2 min-h-[210px] h-full p-4 sm:p-6 backdrop-blur-sm animate-pulse",
        className,
      )}
    >
      <div className="flex flex-1 flex-col min-h-0 w-full">
        {/* Title + icon row */}
        <div className="flex items-center justify-between gap-2">
          <div className="h-3.5 w-24 bg-primary/10 rounded shrink-0" />
          <div className="h-10 w-10 shrink-0 rounded-xl border border-primary/20 bg-primary/5" />
        </div>
        <div className="h-[34px] w-32 bg-primary/10 rounded" />
        <div className="mt-2 h-[18px] w-full bg-primary/10 rounded" />
        <div className="mt-3 flex w-full flex-wrap gap-2">
          <div className="h-6 w-20 bg-primary/10 rounded-md" />
          <div className="h-6 w-24 bg-primary/10 rounded-md" />
          <div className="h-6 w-20 bg-primary/10 rounded-md" />
        </div>
      </div>
    </article>
  );
}
