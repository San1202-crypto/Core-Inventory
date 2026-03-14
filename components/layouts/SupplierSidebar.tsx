"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileWarning,
  UserCircle,
  Mail,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts";
import { useSupplierPortalDashboard } from "@/hooks/queries";

/**
 * Supplier sidebar: Dashboard, My Products, My Orders, Inventory Adjustments.
 */

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  countKey?: string;
};

const SUPPLIER_NAV_ITEMS: NavItem[] = [
  {
    href: "/supplier",
    label: "Portal Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/supplier/products",
    label: "My Products",
    icon: Package,
    countKey: "totalProducts",
  },
  {
    href: "/supplier/orders",
    label: "My Orders",
    icon: ShoppingCart,
    countKey: "totalOrders",
  },
  {
    href: "/supplier/inventory-adjustments",
    label: "Adjustments",
    icon: FileWarning,
  },
];

const ACCOUNT_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Return Home",
    icon: Home,
  },
  {
    href: "/settings/email-preferences",
    label: "Email Prefs",
    icon: Mail,
  },
];

export default function SupplierSidebar({ collapsed = false }: { collapsed?: boolean } = {}) {
  const pathname = usePathname();
  const { data: dashboard } = useSupplierPortalDashboard();

  const linkClass = (href: string) =>
    cn(
      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
      collapsed ? "justify-center px-0 w-9 h-9 mx-auto" : "",
      pathname === href || (href !== "/supplier" && pathname.startsWith(href))
        ? "bg-primary/10 text-primary"
        : "hover:bg-primary/5 text-muted-foreground hover:text-primary",
    );

  const renderNavItems = (items: NavItem[]) =>
    items.map((item) => {
      const Icon = item.icon;
      const count = item.countKey ? (dashboard as any)?.[item.countKey] : undefined;
      const showBadge = count !== undefined && count > 0;

      return (
        <Link
          key={item.href}
          href={item.href}
          className={linkClass(item.href)}
          title={collapsed ? item.label : undefined}
        >
          <Icon className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
          {!collapsed && showBadge && (
            <span
              className={cn(
                "flex-shrink-0 rounded-full px-1.5 py-0.5 text-xs font-medium",
                "bg-primary/10 text-primary",
              )}
            >
              {count > 99 ? "99+" : count}
            </span>
          )}
        </Link>
      );
    });

  return (
    <nav className="flex min-h-0 flex-col p-2 gap-1">
      <p className={cn("px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground", collapsed && "text-center px-1")}>
        {!collapsed ? "Management" : "Mgmt"}
      </p>
      {renderNavItems(SUPPLIER_NAV_ITEMS)}

      <p className={cn("px-3 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground", collapsed && "text-center px-1")}>
        {!collapsed ? "Account" : "Acc"}
      </p>
      {renderNavItems(ACCOUNT_ITEMS)}
    </nav>
  );
}
