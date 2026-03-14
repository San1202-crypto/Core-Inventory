/**
 * Statistics Card Component
 * Glassmorphism card component for displaying warehouse statistics
 * Supports light/dark mode with colored variants (sky, emerald, amber, rose)
 */

import React from "react";
import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Color variant types for statistics cards
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

/**
 * Badge data structure
 */
interface BadgeData {
  label: string;
  value: string | number;
  variant?: "default" | "secondary" | "destructive" | "outline";
}

/**
 * Props for StatisticsCard component
 */
interface StatisticsCardProps {
  /**
   * Card title
   */
  title: string;
  /**
   * Main value to display
   */
  value: string | number;
  /**
   * Optional description text
   */
  description?: string;
  /**
   * Icon component from lucide-react
   */
  icon: LucideIcon;
  /**
   * Color variant for the card
   */
  variant?: CardVariant;
  /**
   * Array of badges to display below the value
   */
  badges?: BadgeData[];
  /**
   * Optional className for additional styling
   */
  className?: string;
}

/**
 * Color configuration for each variant
 */
const variantConfig: Record<
  CardVariant,
  {
    border: string;
    accent: string;
    shadow: string;
  }
> = {
  sky: {
    border: "border-sky-500/20",
    accent: "bg-sky-500",
    shadow: "shadow-sky-500/5",
  },
  emerald: {
    border: "border-emerald-500/20",
    accent: "bg-emerald-500",
    shadow: "shadow-emerald-500/5",
  },
  amber: {
    border: "border-amber-500/20",
    accent: "bg-amber-500",
    shadow: "shadow-amber-500/5",
  },
  rose: {
    border: "border-rose-500/20",
    accent: "bg-rose-500",
    shadow: "shadow-rose-500/5",
  },
  violet: {
    border: "border-violet-500/20",
    accent: "bg-violet-500",
    shadow: "shadow-violet-500/5",
  },
  blue: {
    border: "border-blue-500/20",
    accent: "bg-blue-500",
    shadow: "shadow-blue-500/5",
  },
  orange: {
    border: "border-orange-500/20",
    accent: "bg-orange-500",
    shadow: "shadow-orange-500/5",
  },
  teal: {
    border: "border-teal-500/20",
    accent: "bg-teal-500",
    shadow: "shadow-teal-500/5",
  },
};

/**
 * StatisticsCard component
 * Displays a high-contrast black/white card with statistics, icon, and badges
 */
export function StatisticsCard({
  title,
  value,
  description,
  icon: Icon,
  badges = [],
  className,
}: StatisticsCardProps) {
  return (
    <article
      className={cn(
        "group rounded-none border-2 border-foreground/10 bg-background flex flex-col p-6 transition-all hover:border-foreground min-h-[220px]",
        className,
      )}
    >
      <div className="flex flex-1 flex-col w-full">
        <div className="flex items-center justify-between gap-2 shrink-0 mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/50 font-montserrat">
            {title}
          </p>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-foreground/10 bg-transparent group-hover:bg-foreground group-hover:text-background transition-colors">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        
        <h2 className="text-4xl font-black text-foreground tracking-tighter font-montserrat mb-1">
          {value}
        </h2>
        
        {description && (
          <p className="text-[11px] font-black uppercase tracking-tighter text-foreground/40 font-montserrat">
            {description}
          </p>
        )}

        {badges.length > 0 && (
          <div className="mt-auto pt-6 flex w-full flex-wrap gap-2">
            {badges.map((badge, index) => (
              <div
                key={index}
                className="inline-flex items-center border-2 border-foreground/10 px-3 py-1 text-[10px] font-black uppercase tracking-tighter font-montserrat"
              >
                <span className="text-foreground/40 mr-1.5">{badge.label}</span>
                <span className="text-foreground">{badge.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
