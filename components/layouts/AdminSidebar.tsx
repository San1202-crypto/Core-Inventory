"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Mail,
  LogOut,
  User,
  Users,
  Truck,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Tag,
  UserCircle,
  History,
  Settings as SettingsIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts";
import { Button } from "@/components/ui/button";
import { useAdminCounts } from "@/hooks/queries";

/**
 * Admin sidebar: section headlines + links.
 * Structure per PROJECT_PLAN § 9.16.1: My Store, Product & System Management, Personal Dashboard, System Settings.
 * Dynamic counts beside Client Orders, Client Invoices, Support Tickets, Product Reviews.
 */

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Key in admin counts for badge (optional) */
  countKey?:
    | "clientOrders"
    | "clientInvoices"
    | "supportTickets"
    | "productReviews"
    | "products"
    | "warehouses"
    | "suppliers"
    | "clients"
    | "users"
    | "categories";
};

const DASHBOARD_ITEMS: NavItem[] = [
  {
    href: "/admin/dashboard-overall-insights",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
];

const PRODUCT_ITEMS: NavItem[] = [
  {
    href: "/admin/products",
    label: "Products",
    icon: Package,
    countKey: "products",
  },
  {
    href: "/admin/categories", // Assumed path for category management
    label: "Categories",
    icon: Tag,
    countKey: "categories",
  },
];

const OPERATION_ITEMS: NavItem[] = [
  {
    href: "/admin/receipts",
    label: "Receipts (Incoming Stock)",
    icon: ArrowDownLeft,
  },
  {
    href: "/admin/orders",
    label: "Delivery Orders (Outgoing Stock)",
    icon: ArrowUpRight,
    countKey: "clientOrders",
  },
  {
    href: "/admin/inventory/ledger?action=adjust", // Linking to the adjustment tool
    label: "Inventory Adjustment",
    icon: RefreshCw,
  },
  {
    href: "/admin/inventory/ledger",
    label: "Move History",
    icon: History,
  },
];

const SETTING_ITEMS: NavItem[] = [
  {
    href: "/admin/warehouses",
    label: "Warehouse Settings",
    icon: Warehouse,
    countKey: "warehouses",
  },
  {
    href: "/admin/supplier-portal",
    label: "Supplier Management",
    icon: Truck,
    countKey: "suppliers",
  },
  {
    href: "/admin/user-management",
    label: "User Management",
    icon: Users,
    countKey: "users",
  },
];

const MY_ACTIVITY_ITEMS: NavItem[] = [
  {
    href: "/admin/my-activity",
    label: "My activity",
    icon: UserCircle,
  },
];

export default function AdminSidebar({ collapsed = false }: { collapsed?: boolean } = {}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { data: counts } = useAdminCounts();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  const linkClass = (href: string, isSub = false) =>
    cn(
      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
      isSub && !collapsed ? "pl-8" : "",
      collapsed ? "justify-center px-0 w-9 h-9 mx-auto" : "",
      pathname === href || (href !== "/admin" && pathname.startsWith(href))
        ? "bg-zinc-500/15 dark:bg-zinc-500/20 text-zinc-700 dark:text-zinc-300"
        : "hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300",
    );

  const getCount = (key: NavItem["countKey"]): number | undefined => {
    if (!counts || !key) return undefined;
    return counts[key];
  };

  const renderNavItems = (items: NavItem[], isSub = true) =>
    items.map((item) => {
      const Icon = item.icon;
      const count = getCount(item.countKey);
      const showBadge = count !== undefined && count > 0;
      const isActive = pathname === item.href;
      return (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 px-3 py-3 text-[11px] font-black uppercase tracking-tighter transition-all font-montserrat rounded-none",
            isActive
              ? "bg-foreground text-background"
              : "text-foreground/60 hover:text-foreground hover:bg-foreground/5",
            isSub && "pl-4",
          )}
          title={collapsed ? item.label : undefined}
        >
          <Icon className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
          {!collapsed && showBadge && (
            <span
              className={cn(
                "flex-shrink-0 px-1.5 py-0.5 text-[10px] font-black border-2 border-foreground/10",
                isActive ? "border-background/20 text-background" : "text-foreground",
              )}
              aria-label={`${count} items`}
            >
              {count > 99 ? "99+" : count}
            </span>
          )}
        </Link>
      );
    });

  if (collapsed) {
    return (
      <nav className="flex min-h-0 flex-col items-center py-3 gap-1" aria-label="Admin navigation">
        {renderNavItems(DASHBOARD_ITEMS)}
        <div className="w-6 border-t-2 border-foreground/10 my-1" />
        {renderNavItems(PRODUCT_ITEMS)}
        <div className="w-6 border-t-2 border-foreground/10 my-1" />
        {renderNavItems(OPERATION_ITEMS)}
        <div className="w-6 border-t-2 border-foreground/10 my-1" />
        {renderNavItems(SETTING_ITEMS)}
        <div className="w-6 border-t-2 border-foreground/10 my-1" />
        {renderNavItems(MY_ACTIVITY_ITEMS)}
        <div className="mt-auto">
          <Link
            href="/admin/settings/email-preferences"
            className={cn(
              "flex items-center justify-center h-10 w-10 text-foreground/60 hover:text-foreground transition-all",
              pathname === "/admin/settings/email-preferences" && "bg-foreground text-background"
            )}
            title="Email Preferences"
          >
            <Mail className="h-4 w-4 flex-shrink-0" />
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="flex min-h-0 flex-col p-2 gap-1 overflow-y-auto">
      {/* Dashboard */}
      <p className="px-3 pt-4 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 font-montserrat">
        Overview
      </p>
      {renderNavItems(DASHBOARD_ITEMS)}

      {/* Products */}
      <p className="px-3 pt-6 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 font-montserrat">
        Products
      </p>
      {renderNavItems(PRODUCT_ITEMS)}

      {/* Operations */}
      <p className="px-3 pt-6 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 font-montserrat">
        Operations
      </p>
      {renderNavItems(OPERATION_ITEMS)}

      {/* Settings */}
      <p className="px-3 pt-6 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 font-montserrat">
        Settings
      </p>
      {renderNavItems(SETTING_ITEMS)}

      <div className="mt-auto px-1 pt-8">
        <p className="px-3 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 font-montserrat">
          System
        </p>
        <Link
          href="/admin/settings/email-preferences"
          className={cn(
            "flex items-center gap-3 px-3 py-3 text-[11px] font-black uppercase tracking-tighter transition-all font-montserrat rounded-none",
            pathname === "/admin/settings/email-preferences"
              ? "bg-foreground text-background"
              : "text-foreground/60 hover:text-foreground hover:bg-foreground/5",
          )}
        >
          <Mail className="h-4 w-4 flex-shrink-0" />
          Email Preferences
        </Link>
      </div>
    </nav>
  );
}

