"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck } from "lucide-react";
import axios from "axios";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendOTP = async () => {
    if (resendCooldown > 0 || isResending) return;
    
    setIsResending(true);
    try {
      await axios.post("/api/auth/password-reset/request", { email });
      toast({
        title: "Code Resent!",
        description: "Consistency is key. Check your inbox again.",
      });
      setResendCooldown(60);
    } catch (error: any) {
      toast({
        title: "Resend Failed",
        description: "Wait a moment and try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

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
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white text-black">
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="rounded-[28px] border border-zinc-200 bg-white shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-none border-2 border-black bg-black text-white mb-6">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-black text-black uppercase tracking-tighter font-montserrat">Reset Password</h2>
            <p className="text-zinc-500 mt-2 font-medium">
              Enter the code sent to your email and choose a new password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-tighter text-black font-montserrat">Email</label>
              <Input
                type="email"
                value={email}
                readOnly
                className="w-full h-12 bg-zinc-50 border-2 border-zinc-100 cursor-not-allowed rounded-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-tighter text-black font-montserrat">Verification Code</label>
              <Input
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
                className="w-full h-12 text-center tracking-[0.5em] font-black text-2xl border-2 border-zinc-100 focus:border-black rounded-none"
              />
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] uppercase font-black tracking-tighter text-zinc-300">
                  Code expires in 10 mins
                </span>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendCooldown > 0 || isResending}
                  className="text-[10px] uppercase font-black tracking-tighter text-black hover:text-zinc-500 disabled:text-zinc-300 transition-colors"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-tighter text-black font-montserrat">New Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full h-12 border-2 border-zinc-100 focus:border-black rounded-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-tighter text-black font-montserrat">Confirm Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full h-12 border-2 border-zinc-100 focus:border-black rounded-none"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-black text-white hover:bg-zinc-800 transition-all font-black uppercase tracking-widest rounded-none shadow-none mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
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
