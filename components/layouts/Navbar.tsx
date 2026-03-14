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
  "bg-primary/5 dark:bg-primary/5 border border-primary/20 text-primary/80 backdrop-blur-xl shadow-lg dark:shadow-black/30 rounded-xl";

/** Plain dropdown item: readable text and subtle hover (no heavy gradients) */
const DROPDOWN_ITEM_CLASS =
  "w-full justify-start text-primary/70 hover:bg-primary/10 transition-all duration-200 ease-in-out px-3 py-3 h-auto min-h-[44px] cursor-pointer focus:bg-primary/15 rounded-lg";

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
          className="h-10 w-10 text-foreground border border-foreground/10 rounded-none hover:bg-foreground hover:text-background transition-all duration-300"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 rounded-none border border-foreground bg-background text-foreground shadow-2xl p-1"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="text-[12px] font-bold uppercase py-2 hover:bg-foreground hover:text-background rounded-none cursor-pointer"
        >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="text-[12px] font-bold uppercase py-2 hover:bg-foreground hover:text-background rounded-none cursor-pointer"
        >
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="text-[12px] font-bold uppercase py-2 hover:bg-foreground hover:text-background rounded-none cursor-pointer"
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
      }).catch(() => { });
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
    { label: "Portal Dashboard", path: "/supplier", hasDropdown: false },
    { label: "My Products", path: "/supplier/products", hasDropdown: false },
    { label: "My Orders", path: "/supplier/orders", hasDropdown: false },
    { label: "Adjustments", path: "/supplier/inventory-adjustments", hasDropdown: false },
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
    <header className="sticky top-0 z-50 w-full h-[72px] min-h-[72px] border-b border-foreground/10 bg-background/80 backdrop-blur-md transition-all duration-300">
      {/* Skip to main content - visible on focus for keyboard/screen reader users (WCAG 2.1) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-none focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-background focus:outline-none"
      >
        Skip to main content
      </a>
      <div className="mx-auto flex w-full h-full max-w-9xl items-center justify-between gap-2 sm:gap-4 px-2 sm:px-4 lg:px-6 overflow-x-hidden">
        {/* Left Section - Logo and Brand */}
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => handleNavigation(homePath)}>
          <div
            className="flex aspect-square size-10 items-center justify-center rounded-none border border-foreground bg-foreground text-background transition-all duration-300 group-hover:bg-transparent group-hover:text-foreground"
          >
            <AiFillProduct className="text-2xl" />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-foreground uppercase">
            Inventory
          </h1>
        </div>

        {/* Desktop Navigation (XL screens) */}
        <nav className="hidden xl:flex items-center gap-2 px-4">
          {navItems.map((item) => {
            // API dropdown
            if (item.hasDropdown && "dropdownItems" in item) {
              return (
                <DropdownMenu key={item.label}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[11px] font-black uppercase tracking-widest text-foreground/60 hover:text-foreground transition-all duration-300 px-2 py-1 bg-transparent hover:bg-transparent"
                    >
                      <span>{item.label}</span>
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    sideOffset={2}
                    className="border border-foreground bg-background text-foreground rounded-none shadow-2xl"
                  >
                    {item.dropdownItems.map((sub) => (
                      <DropdownMenuItem
                        key={sub.path}
                        onSelect={() => handleNavigation(sub.path)}
                        className="text-[10px] font-black uppercase tracking-wider hover:bg-foreground hover:text-background cursor-pointer rounded-none"
                      >
                        {sub.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }
            // Regular navigation items (including Dashboard)
            return (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation(item.path)}
                className="text-[11px] font-black uppercase tracking-widest text-foreground/60 hover:text-foreground transition-all duration-300 px-2 py-1 bg-transparent hover:bg-transparent relative group"
              >
                {item.label}
                <span className="absolute left-2 bottom-0 w-0 h-[2px] bg-foreground transition-all duration-300 group-hover:w-[calc(100%-1rem)]"></span>
              </Button>
            );
          })}
        </nav>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 border border-foreground/10 p-1">
            {/* Notification Bell */}
            {isCheckingAuth ? (
              <div className="relative h-9 w-9 rounded-none border border-foreground/5 bg-muted/5 animate-pulse flex items-center justify-center">
                <Bell className="h-4 w-4 text-foreground/20" />
              </div>
            ) : user ? (
              <NotificationBell />
            ) : null}

            {/* Mode Toggle */}
            <ModeToggle />
          </div>

          {/* Avatar Dropdown (Desktop) */}
          <div className="hidden lg:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 h-9 px-2 rounded-none border border-foreground/30 bg-background hover:bg-foreground hover:text-background transition-all duration-300 p-0 overflow-hidden group"
                >
                  {isCheckingAuth ? (
                    <div className="h-5 w-5 bg-muted animate-pulse rounded-none" />
                  ) : avatarUrl ? (
                    <div className="relative h-5 w-5 border border-foreground/20 overflow-hidden">
                      <Image
                        src={avatarUrl}
                        alt={user?.name || "User"}
                        fill
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <span className="text-[9px] font-black">
                      {user?.email?.[0]?.toUpperCase() || "U"}
                    </span>
                  )}
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Profile
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className={`w-56 rounded-none border border-foreground bg-background text-foreground shadow-2xl`}
              >
                <DropdownMenuLabel className="font-normal px-3 py-2">
                  <div className="flex flex-col space-y-1">
                    {user?.name && (
                      <p className="text-sm font-black uppercase text-foreground">
                        {user.name}
                      </p>
                    )}
                    <p className="text-xs text-foreground/50">
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
                  className="flex items-center gap-2 px-3 py-2 text-[12px] font-bold uppercase transition-colors hover:bg-foreground hover:text-background rounded-none cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Support Tickets</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    router.push("/settings/email-preferences");
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-[12px] font-bold uppercase transition-colors hover:bg-foreground hover:text-background rounded-none cursor-pointer"
                >
                  <Settings className="h-4 w-4" />
                  <span>Email Preferences</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    router.push("/api-docs");
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-[12px] font-bold uppercase transition-colors hover:bg-foreground hover:text-background rounded-none cursor-pointer"
                >
                  <FileCode className="h-4 w-4" />
                  <span>API Documentation</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    router.push("/api-status");
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-[12px] font-bold uppercase transition-colors hover:bg-foreground hover:text-background rounded-none cursor-pointer"
                >
                  <Activity className="h-4 w-4" />
                  <span>API Status</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-foreground/10" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-2 px-3 py-2 text-[12px] font-bold uppercase transition-colors hover:bg-destructive hover:text-destructive-foreground rounded-none cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>
                    {isLoggingOut ? "Logging Out..." : "Logout"}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="h-10 w-10 text-foreground border border-foreground/10 rounded-none"
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

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div
          className="xl:hidden border-t border-foreground bg-background px-4 py-8 space-y-8 min-h-screen"
        >
          <div className="flex items-center gap-3">
            {avatarUrl && (
              <div className="h-12 w-12 border border-foreground rounded-none overflow-hidden">
                <Image
                  src={avatarUrl}
                  alt={user?.name || "User"}
                  width={48}
                  height={48}
                  className="grayscale"
                  unoptimized
                />
              </div>
            )}
            <div>
              <p className="text-sm font-black uppercase">{user?.name}</p>
              <p className="text-xs text-foreground/50">{user?.email}</p>
            </div>
          </div>

          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className="justify-start text-lg font-black uppercase tracking-widest px-0 hover:translate-x-2 transition-transform h-auto"
                onClick={() => handleNavigation(item.path)}
              >
                {item.label}
              </Button>
            ))}
          </nav>

          <Separator className="bg-foreground/10" />

          <div className="flex flex-col gap-4">
            <Button
              variant="ghost"
              className="justify-start text-sm font-bold uppercase tracking-wider px-0 h-auto"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      )}
    </header>
  );

  // If children provided, wrap with full layout structure
  if (children) {
    return (
      <div className="flex h-screen overflow-hidden relative min-h-screen bg-background dark:bg-background">
        <ScrollControl />
        {/* Background overlay layer */}
        <div className="pointer-events-none absolute inset-0  dark:"></div>

        <div className="poppins relative z-10 flex h-screen w-full overflow-hidden flex-col">
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

