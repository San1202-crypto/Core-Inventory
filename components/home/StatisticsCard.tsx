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
    gradient: string;
    shadow: string;
    hoverBorder: string;
  }
> = {
  sky: {
    border: "border-primary/20",
    gradient: "bg-gradient-to-br from-primary/5 via-primary/2 to-transparent dark:from-white/10 dark:via-white/5 dark:to-white/2",
    shadow: "shadow-[0_15px_40px_rgba(26,22,20,0.06)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.3)]",
    hoverBorder: "hover:border-primary/40",
  },
  emerald: {
    border: "border-primary/20",
    gradient: "bg-gradient-to-br from-primary/8 via-primary/3 to-transparent dark:from-white/12 dark:via-white/6 dark:to-white/3",
    shadow: "shadow-[0_15px_40px_rgba(26,22,20,0.08)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.35)]",
    hoverBorder: "hover:border-primary/50",
  },
  amber: {
    border: "border-primary/25",
    gradient: "bg-gradient-to-br from-primary/10 via-primary/4 to-transparent dark:from-white/15 dark:via-white/8 dark:to-white/4",
    shadow: "shadow-[0_15px_45px_rgba(26,22,20,0.1)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.4)]",
    hoverBorder: "hover:border-primary/60",
  },
  rose: {
    border: "border-primary/20",
    gradient: "bg-gradient-to-br from-primary/5 via-primary/2 to-transparent dark:from-white/10 dark:via-white/5 dark:to-white/2",
    shadow: "shadow-[0_15px_40px_rgba(26,22,20,0.06)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.3)]",
    hoverBorder: "hover:border-primary/40",
  },
  violet: {
    border: "border-primary/20",
    gradient: "bg-gradient-to-br from-primary/6 via-primary/2 to-transparent dark:from-white/10 dark:via-white/5 dark:to-white/2",
    shadow: "shadow-[0_15px_40px_rgba(26,22,20,0.07)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.32)]",
    hoverBorder: "hover:border-primary/45",
  },
  blue: {
    border: "border-primary/20",
    gradient: "bg-gradient-to-br from-primary/5 via-primary/2 to-transparent dark:from-white/10 dark:via-white/5 dark:to-white/2",
    shadow: "shadow-[0_15px_40px_rgba(26,22,20,0.06)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.3)]",
    hoverBorder: "hover:border-primary/40",
  },
  orange: {
    border: "border-primary/20",
    gradient: "bg-gradient-to-br from-primary/5 via-primary/2 to-transparent dark:from-white/10 dark:via-white/5 dark:to-white/2",
    shadow: "shadow-[0_15px_40px_rgba(26,22,20,0.06)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.3)]",
    hoverBorder: "hover:border-primary/40",
  },
  teal: {
    border: "border-primary/20",
    gradient: "bg-gradient-to-br from-primary/5 via-primary/2 to-transparent dark:from-white/10 dark:via-white/5 dark:to-white/2",
    shadow: "shadow-[0_15px_40px_rgba(26,22,20,0.06)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.3)]",
    hoverBorder: "hover:border-primary/40",
  },
};

/**
 * StatisticsCard component
 * Displays a glassmorphism card with statistics, icon, and badges
 */
export function StatisticsCard({
  title,
  value,
  description,
  icon: Icon,
  className,
  badges = [],
}: StatisticsCardProps) {
  return (
    <article
      className={cn(
        "group rounded-none border border-foreground/10 bg-background min-h-[210px] h-full flex flex-col p-6 transition-all duration-300 hover:border-foreground/40 hover:shadow-2xl min-w-0 overflow-visible",
        className,
      )}
    >
      <div className="flex flex-1 flex-col min-h-0 min-w-0 w-full overflow-visible">
        {/* Title and icon inline so badges get full width below */}
        <div className="flex items-center justify-between gap-2 shrink-0 mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40 min-w-0 group-hover:text-foreground transition-colors">
            {title}
          </p>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none border border-foreground/10 bg-muted/5 group-hover:bg-foreground group-hover:text-background transition-colors duration-300">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className="text-3xl font-black text-foreground uppercase tracking-tighter">
          {value}
        </p>
        {description && (
          <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-foreground/30">
            {description}
          </p>
        )}
        {badges.length > 0 && (
          <div className="mt-6 flex w-full min-w-0 flex-wrap gap-2 overflow-visible">
            {badges.map((badge, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-[10px] font-black uppercase tracking-widest border-foreground/10 bg-transparent text-foreground/60 rounded-none px-2 py-1"
              >
                <span>{badge.label}:</span>{" "}
                <span className="ml-1 text-foreground">{badge.value}</span>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

