"use client";

/**
 * Main app navbar: logo, nav links (role-based: admin vs client vs supplier), theme toggle, notifications, profile menu.
 * Role is inferred from user.role or pathname so correct links show before auth finishes (e.g. on refresh).
 */
import React, { useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  Settings,
  ChevronDown,
  Bell,
  MessageSquare,
  FileCode,
  Activity,
} from "lucide-react";
import { AiFillProduct } from "react-icons/ai";

import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { useTheme } from "next-themes";
import ScrollControl from "../shared/ScrollControl";
import Footer from "./Footer";
import { NotificationBell } from "../shared";

/**
 * RoboHash fallback avatar URL when user has no custom/Google image.
 * Same user (by name or id) always gets the same robot.
 */
const getRoboHashAvatarUrl = (nameOrId: string): string => {
  return `https://robohash.org/${encodeURIComponent(nameOrId)}.png?size=80x80`;
};

/** Plain dropdown panel: solid background for readability in light and dark mode */
const DROPDOWN_CONTENT_CLASS =
  "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white shadow-lg dark:shadow-black/30 rounded-md";

/** Plain dropdown item: readable text and subtle hover (no heavy gradients) */
const DROPDOWN_ITEM_CLASS =
  "w-full justify-start text-gray-700 dark:text-white/90 hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200 ease-in-out px-3 py-3 h-auto min-h-[44px] cursor-pointer focus:bg-gray-100 dark:focus:bg-white/10";

/**
 * Theme toggle component (inline ModeToggle)
 */
function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          className="h-8 w-8 sm:h-10 sm:w-10 focus-visible:outline-none focus:outline-none focus-visible:ring-0 focus:ring-0"
        >
          <Sun className="h-4 w-4 sm:h-[1.2rem] sm:w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 sm:h-[1.2rem] sm:w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={`w-48 ${DROPDOWN_CONTENT_CLASS}`}
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={DROPDOWN_ITEM_CLASS}
        >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={DROPDOWN_ITEM_CLASS}
        >
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={DROPDOWN_ITEM_CLASS}
        >
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface NavbarProps {
  children?: ReactNode;
}

/**
 * Main Navigation Bar Component with Layout Wrapper
 * Handles navigation, user menu, theme toggle, mobile responsive menu
 * Also provides the layout structure with background and scrolling
 */
export default function Navbar({ children }: NavbarProps) {
  const { user, isCheckingAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setIsMobileMenuOpen(false);

    try {
      // Get user name before logout (will be cleared after)
      const userName = user?.name || user?.email?.split("@")[0] || "User";

      // Show success toast immediately so the user sees feedback
      toast({
        title: `Goodbye, ${userName}! 👋`,
        description: "You have been logged out successfully. See you soon!",
      });

      // Clear localStorage keys synchronously (no React re-renders).
      localStorage.removeItem("isAuth");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("token");
      localStorage.removeItem("getSession");
      localStorage.removeItem("prevUserId");
      localStorage.removeItem("stock-inventory-query-cache");

      // Await the server-side logout so the httpOnly session_id cookie is
      // cleared via Set-Cookie BEFORE the browser navigates to /login.
      // (Cookies.remove can't clear httpOnly cookies; only a server
      // response can.)  This is fast — no DB calls, just clears a cookie.
      // We do NOT call logout() from auth context because that would
      // setIsLoggedIn(false) → React re-renders the current page with
      // empty data → "Failed to load" flash.
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      }).catch(() => {});
      window.location.href = "/login";
      return;
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  /**
   * Handle navigation to a path
   */
  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  type NavItem =
    | { label: string; path: string; hasDropdown: false }
    | {
        label: string;
        path: string;
        hasDropdown: true;
        dropdownItems: Array<{ label: string; path: string }>;
      };

  const adminNavItems: NavItem[] = [
    { label: "Dashboard", path: "/", hasDropdown: false },
    { label: "Products", path: "/products", hasDropdown: false },
    { label: "Orders", path: "/orders", hasDropdown: false },
    { label: "Invoices", path: "/invoices", hasDropdown: false },
    { label: "Categories", path: "/categories", hasDropdown: false },
    { label: "Suppliers", path: "/suppliers", hasDropdown: false },
    { label: "Warehouses", path: "/settings/warehouses", hasDropdown: false },
    { label: "Stock", path: "/inventory/stock", hasDropdown: false },
    {
      label: "Business Insights",
      path: "/business-insights",
      hasDropdown: false,
    },
    { label: "Admin Panel", path: "/admin", hasDropdown: false },
  ];

  const clientNavItems: NavItem[] = [
    { label: "Client Portal", path: "/client", hasDropdown: false },
    { label: "Browse Products", path: "/products", hasDropdown: false },
    { label: "My Orders", path: "/orders", hasDropdown: false },
    { label: "My Invoices", path: "/invoices", hasDropdown: false },
  ];

  const supplierNavItems: NavItem[] = [
    { label: "Supplier Portal", path: "/supplier", hasDropdown: false },
    { label: "My Products", path: "/products", hasDropdown: false },
    { label: "View Orders", path: "/orders", hasDropdown: false },
  ];

  // Role from auth when available; else infer from pathname so client/supplier see correct nav on refresh (no admin flash).
  const role =
    user?.role ??
    (pathname?.startsWith("/client")
      ? "client"
      : pathname?.startsWith("/supplier")
        ? "supplier"
        : "user");
  const navItems: NavItem[] =
    role === "client"
      ? clientNavItems
      : role === "supplier"
        ? supplierNavItems
        : adminNavItems;

  /** Home link for logo/brand: admin → /, client → /client, supplier → /supplier */
  const homePath =
    role === "client" ? "/client" : role === "supplier" ? "/supplier" : "/";

  // Avatar: use custom/Google image if present, else RoboHash (same user → same robot)
  const preferredImage =
    user?.image && typeof user.image === "string" && user.image.trim() !== ""
      ? user.image
      : null;
  const avatarUrl =
    preferredImage ||
    (user
      ? getRoboHashAvatarUrl(user?.name || String(user?.id ?? "user"))
      : "");

  // If children prop is provided, wrap with full layout, otherwise just return navbar
  const navbarContent = (
    <header className="sticky top-0 z-50 w-full h-[72px] min-h-[72px] border-b border-foreground/10 bg-background transition-all duration-300">
      {/* Skip to main content - visible on focus for keyboard/screen reader users (WCAG 2.1) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-none focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:font-black focus:text-background focus:outline-none focus:ring-0"
      >
        Skip to main content
      </a>
      <div className="mx-auto flex w-full h-full max-w-9xl items-center justify-between gap-2 sm:gap-4 px-2 sm:px-4 lg:px-6 overflow-x-hidden">
        {/* Left Section - Logo and Brand */}
        <div className="flex items-center gap-3">
          <div
            role="button"
            tabIndex={0}
            aria-label="Go to home"
            className="flex aspect-square size-8 items-center justify-center bg-foreground cursor-pointer transition-all duration-200 hover:opacity-90"
            onClick={() => handleNavigation(homePath)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleNavigation(homePath);
              }
            }}
          >
            <div className="grid grid-cols-2 gap-0.5 p-1.5">
              <div className="size-2 bg-background"></div>
              <div className="size-2 bg-background"></div>
              <div className="size-2 bg-background"></div>
              <div className="size-2 bg-background"></div>
            </div>
          </div>
          <h1 className="text-xl font-black tracking-tighter text-foreground uppercase font-montserrat cursor-pointer hover:opacity-80 transition-opacity">
            Inventory
          </h1>
        </div>

        {/* Desktop Navigation (XL screens) */}
        <nav className="hidden xl:flex items-center gap-1">
          {navItems.map((item) => {
            // API dropdown
            if (item.hasDropdown && "dropdownItems" in item) {
              return (
                <DropdownMenu key={item.label}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[11px] font-black uppercase tracking-tighter text-foreground/70 hover:text-foreground hover:bg-transparent transition-colors font-montserrat"
                    >
                      <span>{item.label}</span>
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    sideOffset={2}
                    className="w-48 border-2 border-foreground bg-background text-foreground rounded-none shadow-none"
                  >
                    {item.dropdownItems.map((sub) => (
                      <DropdownMenuItem
                        key={sub.path}
                        className="text-[11px] font-black uppercase tracking-tighter cursor-pointer focus:bg-foreground focus:text-background rounded-none py-3 font-montserrat"
                        onSelect={() => handleNavigation(sub.path)}
                      >
                        {sub.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }
            // Regular navigation items (including Dashboard)
            const isActive = pathname === item.path;
            return (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation(item.path)}
                className={`text-[11px] font-black uppercase tracking-tighter transition-colors font-montserrat px-3 ${
                  isActive
                    ? "text-foreground"
                    : "text-foreground/60 hover:text-foreground hover:bg-transparent"
                }`}
              >
                {item.label}
              </Button>
            );
          })}
        </nav>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <NotificationBell />

          {/* Mode Toggle */}
          <ModeToggle />

          {/* Avatar Dropdown (Desktop - LG and above) */}
          <div className="hidden lg:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  aria-label="Open account menu"
                  className="relative h-9 w-9 rounded-none border-2 border-foreground/10 p-0 hover:border-foreground transition-all"
                >
                  <div className="flex h-full w-full items-center justify-center bg-foreground text-background text-[10px] font-black uppercase font-montserrat">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 border-2 border-foreground bg-background text-foreground rounded-none shadow-none"
              >
                <DropdownMenuLabel className="font-black uppercase tracking-tighter text-[11px] font-montserrat px-3 py-4">
                  <div className="flex flex-col space-y-1">
                    {user?.name && (
                      <p className="text-[11px] leading-none text-foreground uppercase">
                        {user.name}
                      </p>
                    )}
                    <p className="text-[10px] text-foreground/60 normal-case">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-foreground/10" />
                <DropdownMenuItem
                  onClick={() => {
                    router.push("/support-tickets");
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-[11px] font-black uppercase tracking-tighter cursor-pointer focus:bg-foreground focus:text-background rounded-none py-3 font-montserrat"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>Support Tickets</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    router.push("/settings/email-preferences");
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-[11px] font-black uppercase tracking-tighter cursor-pointer focus:bg-foreground focus:text-background rounded-none py-3 font-montserrat"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Email Preferences</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    router.push("/api-docs");
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-[11px] font-black uppercase tracking-tighter cursor-pointer focus:bg-foreground focus:text-background rounded-none py-3 font-montserrat"
                >
                  <FileCode className="mr-2 h-4 w-4" />
                  <span>API Documentation</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    router.push("/api-status");
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-[11px] font-black uppercase tracking-tighter cursor-pointer focus:bg-foreground focus:text-background rounded-none py-3 font-montserrat"
                >
                  <Activity className="mr-2 h-4 w-4" />
                  <span>API Status</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-foreground/10" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-[11px] font-black uppercase tracking-tighter cursor-pointer focus:bg-foreground focus:text-background rounded-none py-3 font-montserrat text-destructive focus:text-destructive-foreground"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>
                    {isLoggingOut ? "Logging Out..." : "Logout"}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile: Burger Menu Only (LG and below) */}
          <div className="flex items-center lg:hidden">
            {/* Burger Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu-panel"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="h-9 w-9 text-foreground hover:bg-transparent"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown (LG and below) */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu-panel"
          role="navigation"
          aria-label="Mobile navigation"
          className="lg:hidden border-t-2 border-foreground bg-background fixed inset-x-0 bottom-0 top-[72px] z-[100] overflow-y-auto"
        >
          <div className="flex flex-col p-6 space-y-6">
            {navItems.map((item) => (
              <div key={item.label} className="flex flex-col gap-4">
                <button
                  className={cn(
                    "text-2xl font-black uppercase tracking-tighter text-left font-montserrat",
                    pathname === item.path ? "text-foreground" : "text-foreground/40"
                  )}
                  onClick={() => handleNavigation(item.path)}
                >
                  {item.label}
                </button>
                {"dropdownItems" in item && (
                  <div className="flex flex-col gap-3 pl-4 border-l-2 border-foreground/10">
                    {item.dropdownItems.map((sub) => (
                      <button
                        key={sub.path}
                        className="text-sm font-black uppercase tracking-tighter text-left text-foreground/40 hover:text-foreground font-montserrat"
                        onClick={() => handleNavigation(sub.path)}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-6 border-t-2 border-foreground/10 flex flex-col gap-4">
               <button
                  className="text-lg font-black uppercase tracking-tighter text-left text-destructive font-montserrat"
                  onClick={handleLogout}
                >
                  Logout
                </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );

  // If children provided, wrap with full layout structure
  if (children) {
    return (
      <div className="flex h-screen overflow-hidden relative min-h-screen bg-background">
        <ScrollControl />
        <div className="font-poppins relative z-10 flex h-screen w-full overflow-hidden flex-col">
          {navbarContent}
          <main
            id="main-content"
            className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col"
            tabIndex={-1}
          >
            <div className="flex-1 flex flex-col">
              <div
                className={
                  pathname?.startsWith("/admin") ||
                  pathname?.startsWith("/business-insights")
                    ? "mx-auto w-full max-w-9xl flex-1 sm:pr-4"
                    : "mx-auto w-full max-w-9xl p-1 sm:p-0 sm:px-4 lg:px-6 sm:py-6 flex-1"
                }
              >
                {children}
              </div>
            </div>
            {!pathname?.startsWith("/admin") && <Footer />}
          </main>
        </div>
      </div>
    );
  }

  // Otherwise just return the navbar (for backward compatibility)
  return navbarContent;
}
