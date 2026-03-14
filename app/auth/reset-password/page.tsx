"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, KeyRound, ShieldCheck } from "lucide-react";
import axios from "axios";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      return toast({
        title: "Passwords Mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
    }

    setIsLoading(true);

    try {
      await axios.post("/api/auth/password-reset/verify", {
        email,
        otp,
        newPassword,
      });
      
      toast({
        title: "Success! 🎉",
        description: "Your password has been reset. You can now log in.",
      });
      
      router.push("/login");
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.response?.data?.error || "Invalid code or expired. Please try again.",
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
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 mb-4">
              <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reset Password</h2>
            <p className="text-gray-600 dark:text-white/70 mt-2">
              Enter the code sent to your email and choose a new password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-white/80">Email</label>
              <Input
                type="email"
                value={email}
                readOnly
                className="w-full bg-gray-100/50 dark:bg-white/5 border-sky-400/10 dark:border-white/10 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-white/80">Verification Code</label>
              <Input
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
                className="w-full text-center tracking-widest font-mono text-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-white/80">New Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-white/80">Confirm Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
