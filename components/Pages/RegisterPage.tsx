"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/utils/axiosInstance";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { BarChart3, Shield, Zap, CheckCircle2 } from "lucide-react";

/**
 * Register Page Component
 * Features:
 * - Split layout with SVG background on left, form on right
 * - Google OAuth integration (placeholder)
 * - Responsive design (mobile-first)
 * - Dynamic toast notifications
 */
export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  /**
   * Handle Google OAuth sign-up
   * Redirects to Google OAuth flow
   */
  const handleGoogleSignUp = async () => {
    try {
      // Redirect to OAuth route (same flow as login)
      const oauthUrl = `/api/auth/oauth/google?callback=/`;

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
   * Handle form submission for email/password registration
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate password confirmation
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post("/auth/register", {
        name,
        email,
        password,
      });

      if (response.status === 201) {
        // Show success toast
        toast({
          title: "Account Created Successfully! 🎉",
          description: `Welcome, ${name}! Your account has been created. Redirecting to login page...`,
        });

        // Clear form
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");

        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        throw new Error("Registration failed");
      }
    } catch (error: unknown) {
      const axiosErr = error as {
        response?: { data?: { error?: string }; status?: number };
      };
      const serverMessage = axiosErr?.response?.data?.error;
      toast({
        title: "Registration Failed",
        description:
          serverMessage || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 md:grid-cols-2 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="p-6 sm:p-8 md:p-10">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-2xl font-semibold text-foreground">Create Account</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Sign up to get started with your inventory dashboard</p>
          </div>
          <div className="h-4" />
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">Name</label>
              <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required className="w-full border-border bg-muted/50 text-foreground placeholder:text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full border-border bg-muted/50 text-foreground placeholder:text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required className="w-full border-border bg-muted/50 text-foreground placeholder:text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">Confirm Password</label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password" required className="w-full border-border bg-muted/50 text-foreground placeholder:text-muted-foreground" />
            </div>
            <Button type="submit" className="w-full rounded-md bg-primary text-primary-foreground hover:opacity-90" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>
          <div className="h-5" />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <Button type="button" variant="outline" onClick={handleGoogleSignUp} disabled={isLoading} className="mt-4 w-full border-border bg-transparent text-foreground hover:bg-muted">
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </Button>
          <div className="text-center text-sm mt-4">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-foreground underline-offset-4 hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
        <div className="relative hidden md:block">
          <div className="absolute inset-0 bg-gradient-to-br from-card to-muted" />
          <div className="absolute inset-0 [background:radial-gradient(currentColor_1px,transparent_1.6px)] [background-size:6px_6px] text-foreground/60 opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-l from-card via-card/60 to-transparent" />
          <div className="h-full min-h-[28rem] w-full" />
        </div>
      </div>
    </div>
  );
}

