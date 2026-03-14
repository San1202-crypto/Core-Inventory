import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

/**
 * Color variant types for analytics cards (matching StatisticsCard)
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

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconColor?: string;
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
    gradient:
      "bg-gradient-to-br from-primary/5 via-primary/2 to-transparent dark:from-white/10 dark:via-white/5 dark:to-white/2",
    shadow:
      "shadow-[0_15px_40px_rgba(26,22,20,0.06)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.3)]",
    hoverBorder: "hover:border-primary/40",
  },
  emerald: {
    border: "border-primary/20",
    gradient:
      "bg-gradient-to-br from-primary/5 via-primary/2 to-transparent dark:from-white/10 dark:via-white/5 dark:to-white/2",
    shadow:
      "shadow-[0_15px_40px_rgba(26,22,20,0.06)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.3)]",
    hoverBorder: "hover:border-primary/40",
  },
  amber: {
    border: "border-primary/25",
    gradient:
      "bg-gradient-to-br from-primary/8 via-primary/3 to-transparent dark:from-white/12 dark:via-white/6 dark:to-white/3",
    shadow:
      "shadow-[0_15px_45px_rgba(26,22,20,0.1)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.4)]",
    hoverBorder: "hover:border-primary/60",
  },
  rose: {
    border: "border-primary/20",
    gradient:
      "bg-gradient-to-br from-primary/5 via-primary/2 to-transparent dark:from-white/10 dark:via-white/5 dark:to-white/2",
    shadow:
      "shadow-[0_15px_40px_rgba(26,22,20,0.06)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.3)]",
    hoverBorder: "hover:border-primary/40",
  },
  violet: {
    border: "border-primary/20",
    gradient:
      "bg-gradient-to-br from-primary/5 via-primary/2 to-transparent dark:from-white/10 dark:via-white/5 dark:to-white/2",
    shadow:
      "shadow-[0_15px_40px_rgba(26,22,20,0.06)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.3)]",
    hoverBorder: "hover:border-primary/40",
  },
  blue: {
    border: "border-primary/20",
    gradient:
      "bg-gradient-to-br from-primary/5 via-primary/2 to-transparent dark:from-white/10 dark:via-white/5 dark:to-white/2",
    shadow:
      "shadow-[0_15px_40px_rgba(26,22,20,0.06)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.3)]",
    hoverBorder: "hover:border-primary/40",
  },
  orange: {
    border: "border-primary/20",
    gradient:
      "bg-gradient-to-br from-primary/5 via-primary/2 to-transparent dark:from-white/10 dark:via-white/5 dark:to-white/2",
    shadow:
      "shadow-[0_15px_40px_rgba(26,22,20,0.06)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.3)]",
    hoverBorder: "hover:border-primary/40",
  },
  teal: {
    border: "border-primary/20",
    gradient:
      "bg-gradient-to-br from-primary/5 via-primary/2 to-transparent dark:from-white/10 dark:via-white/5 dark:to-white/2",
    shadow:
      "shadow-[0_15px_40px_rgba(26,22,20,0.06)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.3)]",
    hoverBorder: "hover:border-primary/40",
  },
};

export function AnalyticsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  iconColor = "text-primary/70",
  variant = "blue",
}: AnalyticsCardProps) {
  const config = variantConfig[variant];

  return (
    <article
      className={cn(
        "group rounded-[20px] border min-h-[140px] h-full p-4 sm:p-5 backdrop-blur-sm transition",
        config.border,
        config.gradient,
        config.shadow,
        config.hoverBorder,
        className,
      )}
    >
      <div className="flex flex-col w-full">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-700 dark:text-white/60 font-medium shrink-0">
            {title}
          </p>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 shadow-inner shadow-primary/20 backdrop-blur">
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        </div>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
          {value}
        </p>
        {description && (
          <p className="mt-2 text-sm text-gray-600 dark:text-white/70">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <span
              className="text-xs font-medium text-primary/70"
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
            <span className="text-xs text-gray-500 dark:text-white/60 ml-1">
              from last month
            </span>
          </div>
        )}
      </div>
    </article>
  );
}

