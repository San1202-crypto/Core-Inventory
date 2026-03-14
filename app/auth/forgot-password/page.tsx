"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import axios from "axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post("/api/auth/password-reset/request", { email });
      
      toast({
        title: "Code Sent! 📧",
        description: "If an account exists, you will receive a verification code shortly.",
      });
      
      // Pass email to reset page to pre-fill
      router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      toast({
        title: "Request Failed",
        description: error.response?.data?.error || "Failed to send reset code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),transparent_55%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.12),transparent_65%)] dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),transparent_55%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.12),transparent_65%)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.3),transparent_60%)] dark:bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05),transparent_60%)]"></div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="rounded-[28px] border border-sky-400/30 dark:border-white/10 bg-gradient-to-br from-sky-500/25 via-sky-500/10 to-sky-500/5 dark:from-white/5 dark:via-white/5 dark:to-white/5 backdrop-blur-md shadow-[0_30px_80px_rgba(2,132,199,0.35)] p-8">
          <Link 
            href="/login" 
            className="inline-flex items-center text-sm text-gray-500 hover:text-sky-600 transition-colors mb-6 group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Login
          </Link>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sky-500/20 mb-4">
              <Mail className="h-6 w-6 text-sky-600 dark:text-sky-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot Password?</h2>
            <p className="text-gray-600 dark:text-white/70 mt-2">
              Enter your email and we'll send you a code to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-white/80">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/10 dark:bg-white/5 border-sky-400/30 dark:border-white/20 text-gray-900 dark:text-white"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Code...
                </>
              ) : (
                "Send Reset Code"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
