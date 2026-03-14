import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import React from "react";

/**
 * Color variant types for chart cards
 */
type CardVariant =
  | "sky"
  | "emerald"
  | "amber"
  | "rose"
  | "violet"
  | "blue"
  | "orange"
  | "teal"
  | "neutral";

interface ChartCardProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  description?: string;
  variant?: CardVariant;
}

/**
 * Color configuration for each variant - glassmorphic style
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
    gradient: "bg-gradient-to-br from-primary/5 via-primary/2 to-transparent dark:from-white/10 dark:via-white/5 dark:to-white/2",
    shadow: "shadow-[0_15px_40px_rgba(26,22,20,0.06)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.3)]",
    hoverBorder: "hover:border-primary/40",
  },
  amber: {
    border: "border-primary/25",
    gradient: "bg-gradient-to-br from-primary/8 via-primary/3 to-transparent dark:from-white/12 dark:via-white/6 dark:to-white/3",
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
    gradient: "bg-gradient-to-br from-primary/5 via-primary/2 to-transparent dark:from-white/10 dark:via-white/5 dark:to-white/2",
    shadow: "shadow-[0_15px_40px_rgba(26,22,20,0.06)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.3)]",
    hoverBorder: "hover:border-primary/40",
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
  neutral: {
    border: "border-primary/10 dark:border-white/10",
    gradient: "bg-gradient-to-br from-primary/5 via-primary/2 to-transparent dark:from-white/5 dark:via-white/2 dark:to-transparent",
    shadow: "shadow-[0_15px_40px_rgba(26,22,20,0.04)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.25)]",
    hoverBorder: "hover:border-primary/30 dark:hover:border-white/20",
  },
};

export function ChartCard({
  title,
  icon: Icon,
  children,
  className,
  description,
  variant = "neutral",
}: ChartCardProps) {
  const config = variantConfig[variant];

  return (
    <article
      className={cn(
        "group rounded-[20px] border backdrop-blur-sm transition overflow-hidden",
        config.border,
        config.gradient,
        config.shadow,
        config.hoverBorder,
        className,
      )}
    >
      <div className="flex flex-row items-center justify-between px-4 sm:px-5 pt-4 sm:pt-5 pb-3">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-600 dark:text-white/70 mt-1">
              {description}
            </p>
          )}
        </div>
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 backdrop-blur">
            <Icon className="h-4 w-4 text-primary/70" />
          </div>
        )}
      </div>
      <div className="px-4 sm:px-5 pb-4 sm:pb-5">{children}</div>
    </article>
  );
}

