"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useAuth } from "@/contexts";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Shield, Loader2, Store, ShoppingBag, Users, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

/**
 * Test account credentials for quick login (demo / production).
 * Main account: test@admin.com (full privileges). Run scripts/update-demo-user.ts --to admin once to migrate existing test@user.com to test@admin.com. Client/supplier for later.
 */
const testAccounts = {
  "guest-user": {
    email: "test@admin.com",
    password: "12345678",
  },
  "guest-supplier": {
    email: "test@supplier.com",
    password: "12345678",
  },
  "guest-client": {
    email: "test@client.com",
    password: "12345678",
  },
};

/**
 * Login page client component (uses useSearchParams for OAuth/redirect).
 */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigatingToHome, setIsNavigatingToHome] = useState(false);
  const [selectMounted, setSelectMounted] = useState(false);
  const { login, isLoggedIn, user } = useAuth();
  const { theme, setTheme } = useTheme();

  // useLayoutEffect runs before paint so the Select appears on first paint (no flash)
  useLayoutEffect(() => {
    setSelectMounted(true);
  }, []);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const navigatingFromSubmitRef = useRef(false);

  // Redirect if already logged in (e.g. landed on /login with cookie).
  useEffect(() => {
    if (isLoggedIn && !navigatingFromSubmitRef.current) {
      const dest =
        user?.role === "client"
          ? "/client"
          : user?.role === "supplier"
            ? "/supplier"
            : "/";
      window.location.href = dest;
    }
  }, [isLoggedIn, user]);

  // Handle OAuth errors from callback
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      let errorMessage = "An error occurred during Google sign-in.";

      switch (error) {
        case "oauth_not_configured":
          errorMessage =
            "Google OAuth is not configured. Please contact support.";
          break;
        case "oauth_failed":
          errorMessage =
            "Google sign-in was cancelled or failed. Please try again.";
          break;
        case "invalid_state":
          errorMessage = "Invalid OAuth state. Please try again.";
          break;
        case "no_code":
          errorMessage = "OAuth authorization code missing. Please try again.";
          break;
        case "token_exchange_failed":
          errorMessage = "Failed to exchange OAuth token. Please try again.";
          break;
        case "fetch_user_failed":
          errorMessage =
            "Failed to fetch user information from Google. Please try again.";
          break;
        case "no_email":
          errorMessage = "Google account email is required. Please try again.";
          break;
        case "oauth_processing_failed":
        case "oauth_error":
          errorMessage =
            "An error occurred during OAuth processing. Please try again.";
          break;
        default:
          errorMessage = `OAuth error: ${error}. Please try again.`;
      }

      toast({
        title: "Google Sign-In Failed",
        description: errorMessage,
        variant: "destructive",
      });

      // Clean up URL
      router.replace("/login");
    }
  }, [searchParams, router, toast]);

  /**
   * Handle test account selection from dropdown
   * Auto-fills email and password fields
   */
  const handleRoleSelect = (value: string) => {
    if (value === "clear") {
      setSelectedRole("");
      setEmail("");
      setPassword("");
    } else {
      setSelectedRole(value);
      const account = testAccounts[value as keyof typeof testAccounts];
      if (account) {
        setEmail(account.email);
        setPassword(account.password);
      }
    }
  };

  /**
   * Handle Google OAuth sign-in
   * Redirects to Google OAuth flow
   */
  const handleGoogleSignIn = async () => {
    try {
      // Get callback URL from search params or use default
      const redirectUrl = searchParams.get("redirect") || "/";

      // Redirect to OAuth route with callback parameter
      const oauthUrl = `/api/auth/oauth/google?callback=${encodeURIComponent(
        redirectUrl,
      )}`;

      window.location.href = oauthUrl;
    } catch (error) {
      console.error("Error initiating Google OAuth:", error);
      toast({
        title: "OAuth Error",
        description: "Failed to initiate Google sign-in. Please try again.",
        variant: "destructive",
      });
    }
  };

  /**
   * Handle form submission for email/password login
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userData = await login(email, password);

      const userName = userData.name || userData.email.split("@")[0] || "User";

      navigatingFromSubmitRef.current = true;
      setIsNavigatingToHome(true);

      toast({
        title: `Welcome back, ${userName}! 👋`,
        description: "You have successfully logged in. Enjoy your stay!",
      });

      setEmail("");
      setPassword("");
      setSelectedRole("");

      // Full-page navigation to the correct dashboard for the user's role.
      // window.location.href bypasses the Next.js RSC cache which can contain
      // stale 307 redirects from before login, causing infinite redirect loops.
      const dest =
        userData.role === "client"
          ? "/client"
          : userData.role === "supplier"
            ? "/supplier"
            : "/";
      window.location.href = dest;
    } catch (error: unknown) {
      const axiosErr = error as {
        response?: { data?: { error?: string }; status?: number };
      };
      const serverMessage = axiosErr?.response?.data?.error;
      toast({
        title: "Login Failed",
        description:
          serverMessage || "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Only clear loading when we're not redirecting (error path); on success button keeps Loader2 until unmount
      if (!navigatingFromSubmitRef.current) setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 md:grid-cols-2 overflow-hidden rounded-none border border-foreground bg-background shadow-[0_40px_80px_rgba(0,0,0,0.1)]">
        <div className="p-8 sm:p-10 md:p-12">
          <div className="mb-4 flex justify-end">
            <div className="inline-flex border border-foreground rounded-none overflow-hidden">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`flex items-center gap-1 px-3 py-1 text-[11px] font-black uppercase tracking-widest ${theme === "light" ? "bg-foreground text-background" : "text-foreground hover:bg-foreground/10"}`}
              >
                <Sun className="h-3.5 w-3.5" />
                Light
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`flex items-center gap-1 px-3 py-1 text-[11px] font-black uppercase tracking-widest border-l border-foreground ${theme === "dark" ? "bg-foreground text-background" : "text-foreground hover:bg-foreground/10"}`}
              >
                <Moon className="h-3.5 w-3.5" />
                Dark
              </button>
            </div>
          </div>
          <div className="mb-8 space-y-2">
            <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter">Sign In</h1>
            <p className="text-[13px] font-bold text-foreground/40 uppercase tracking-widest">
              Access the master inventory system
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isLoading || isNavigatingToHome}
            className="mb-8 w-full border border-foreground rounded-none bg-transparent text-foreground hover:bg-foreground hover:text-background font-bold uppercase tracking-wider py-6 transition-all duration-300"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" />
            </svg>
            Sign in with Google
          </Button>

          <div className="mb-8 flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-foreground/10" />
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Master Auth</span>
            <div className="h-[1px] flex-1 bg-foreground/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mb-8">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground">Role Selection</label>
              {!selectMounted ? (
                <div className="h-[52px] w-full border border-foreground/10 bg-muted/5 animate-pulse" />
              ) : (
                <Select key={`select-${selectedRole || "empty"}`} value={selectedRole || undefined} onValueChange={handleRoleSelect}>
                  <SelectTrigger className="w-full border-foreground rounded-none bg-background text-foreground h-[52px] focus:ring-0">
                    <SelectValue placeholder="Select Gateway" />
                  </SelectTrigger>
                  <SelectContent className="border-foreground bg-background rounded-none">
                    <SelectItem value="guest-user" className="cursor-pointer font-bold uppercase text-[12px]">
                      Administrator
                    </SelectItem>
                    <SelectItem value="guest-supplier" className="cursor-pointer font-bold uppercase text-[12px]">
                      Supplier
                    </SelectItem>
                    <SelectItem value="guest-client" className="cursor-pointer font-bold uppercase text-[12px]">
                      Client
                    </SelectItem>
                    {selectedRole && <SelectItem value="clear">Clear selection</SelectItem>}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="master@inventory.com"
                required
                className="w-full border border-foreground rounded-none bg-background text-foreground h-[52px] placeholder:text-foreground/20 focus:ring-0"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-foreground rounded-none bg-background text-foreground h-[52px] placeholder:text-foreground/20 focus:ring-0"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-[52px] rounded-none bg-foreground text-background hover:bg-transparent hover:text-foreground border border-foreground font-black uppercase tracking-widest transition-all duration-300"
              disabled={isLoading || isNavigatingToHome}
            >
              {isNavigatingToHome || isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Authorize"
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-[12px] font-bold uppercase tracking-wider text-foreground/40 space-x-2">
              <span>New Here?</span>
              <Link href="/register" className="text-foreground border-b border-foreground hover:border-transparent transition-all">
                Create Account
              </Link>
            </p>
          </div>
        </div>

        <div className="relative hidden md:block bg-foreground overflow-hidden">
          <div className="absolute inset-0 [background:radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="border border-background/20 p-12 -rotate-12 scale-150 opacity-10">
              <Shield size={200} className="text-background" />
            </div>
          </div>
          <div className="absolute bottom-12 left-12 right-12">
            <div className="h-[2px] w-12 bg-background mb-4" />
            <p className="text-background text-2xl font-black uppercase leading-none tracking-tighter">
              Master<br />Systems<br />Control.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

