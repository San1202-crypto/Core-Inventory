/**
 * Create User Dialog (Admin)
 */

"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Eye, EyeOff, UserPlus } from "lucide-react";
import { useCreateUser } from "@/hooks/queries";
import {
  createUserAdminSchema,
  type CreateUserAdminFormData,
} from "@/lib/validations/user-management";

const ROLE_OPTIONS = [
  { value: "user", label: "User", color: "text-gray-600 dark:text-gray-400" },
  { value: "admin", label: "Admin", color: "text-zinc-600 dark:text-zinc-400" },
  {
    value: "supplier",
    label: "Supplier",
    color: "text-zinc-600 dark:text-zinc-400",
  },
  {
    value: "client",
    label: "Client",
    color: "text-zinc-600 dark:text-zinc-400",
  },
  {
    value: "retailer",
    label: "Retailer",
    color: "text-zinc-600 dark:text-zinc-400",
  },
];

export default function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const createUserMutation = useCreateUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateUserAdminFormData>({
    resolver: zodResolver(createUserAdminSchema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
      username: "",
      role: "user",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: CreateUserAdminFormData) => {
    createUserMutation.mutate(data, {
      onSuccess: () => {
        reset();
        setOpen(false);
      },
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      reset();
      setShowPassword(false);
    }
  };

  const isPending = createUserMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2 h-10 font-semibold inline-flex items-center justify-center rounded-xl border border-zinc-400/30 dark:border-zinc-400/30 bg-gradient-to-r from-zinc-500/40 via-zinc-500/30 to-zinc-500/20 dark:from-zinc-500/40 dark:via-zinc-500/30 dark:to-zinc-500/20 text-white shadow-[0_15px_35px_rgba(0,0,0,0.35)] backdrop-blur-sm transition duration-200 hover:border-zinc-300/50 hover:from-zinc-500/50 hover:via-zinc-500/40 hover:to-zinc-500/30 dark:hover:border-zinc-300/50 dark:hover:from-zinc-500/50 dark:hover:via-zinc-500/40 dark:hover:to-zinc-500/30">
          <Plus className="h-4 w-4" />
          Create User
        </Button>
      </DialogTrigger>
      <DialogContent
        className="p-4 sm:p-7 sm:px-8 poppins max-h-[90vh] overflow-y-auto border-zinc-400/30 dark:border-zinc-400/30 shadow-[0_30px_80px_rgba(0,0,0,0.35)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.25)]"
      >
        <DialogHeader>
          <DialogTitle className="text-[22px] text-white flex items-center gap-3">
            <div className="p-2 rounded-xl border border-zinc-300/30 bg-zinc-100/50 dark:border-zinc-400/30 dark:bg-zinc-500/20">
              <UserPlus className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            </div>
            Create New User
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Add a new user to the system with their details and role.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-white/80"
              >
                Full Name *
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="John Doe"
                autoComplete="off"
                className="h-11 border-zinc-400/30 dark:border-white/20 bg-white/10 dark:bg-white/5 backdrop-blur-sm text-white placeholder:text-white/40 focus:border-zinc-400 focus:ring-zinc-500/50 shadow-[0_10px_30px_rgba(0,0,0,0.05)]"
              />
              {errors.name && (
                <p className="text-sm text-zinc-400">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-sm font-medium text-white/80"
              >
                Username
              </Label>
              <Input
                id="username"
                {...register("username")}
                placeholder="johndoe"
                autoComplete="off"
                className="h-11 border-zinc-400/30 dark:border-white/20 bg-white/10 dark:bg-white/5 backdrop-blur-sm text-white placeholder:text-white/40 focus:border-zinc-400 focus:ring-zinc-500/50 shadow-[0_10px_30px_rgba(0,0,0,0.05)]"
              />
              {errors.username && (
                <p className="text-sm text-zinc-400">
                  {errors.username.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-white/80"
            >
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="john@example.com"
              autoComplete="off"
              className="h-11 border-zinc-400/30 dark:border-white/20 bg-white/10 dark:bg-white/5 backdrop-blur-sm text-white placeholder:text-white/40 focus:border-zinc-400 focus:ring-zinc-500/50 shadow-[0_10px_30px_rgba(0,0,0,0.05)]"
            />
            {errors.email && (
              <p className="text-sm text-zinc-400">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-white/80"
            >
              Password *
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="••••••••"
                autoComplete="new-password"
                className="h-11 pr-10 border-zinc-400/30 dark:border-white/20 bg-white/10 dark:bg-white/5 backdrop-blur-sm text-white placeholder:text-white/40 focus:border-zinc-400 focus:ring-zinc-500/50 shadow-[0_10px_30px_rgba(0,0,0,0.05)]"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-white/60 hover:text-white/80"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-zinc-400">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium text-white/80">
              User Role
            </Label>
            <Select
              value={selectedRole ?? "user"}
              onValueChange={(val) =>
                setValue("role", val as CreateUserAdminFormData["role"])
              }
            >
              <SelectTrigger className="h-11 w-full border-zinc-400/30 dark:border-white/20 bg-white/10 dark:bg-white/5 backdrop-blur-sm text-white placeholder:text-white/40 focus:border-zinc-400 focus:ring-zinc-500/50 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent
                className="border-zinc-400/20 dark:border-white/10 bg-white/80 dark:bg-popover/50 backdrop-blur-sm z-[100]"
                position="popper"
                sideOffset={5}
                align="start"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className={`cursor-pointer focus:bg-zinc-100 dark:focus:bg-white/10 focus:text-gray-900 dark:focus:text-white ${opt.color}`}
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-zinc-400">{errors.role.message}</p>
            )}
          </div>

          <DialogFooter className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                className="h-11 w-full sm:w-auto px-8 inline-flex items-center justify-center rounded-xl border border-white/10 bg-gradient-to-r from-gray-400/40 via-gray-300/30 to-gray-400/40 dark:bg-background/50 backdrop-blur-sm shadow-[0_15px_35px_rgba(0,0,0,0.3)] dark:shadow-[0_15px_35px_rgba(255,255,255,0.25)] transition duration-200 hover:bg-gradient-to-r hover:from-gray-400/60 hover:via-gray-300/50 hover:to-gray-400/60 dark:hover:bg-accent/50 hover:border-white/20 dark:hover:border-white/20"
                disabled={isPending}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isPending}
              className="h-11 w-full sm:w-auto px-8 inline-flex items-center justify-center rounded-xl border border-zinc-400/30 dark:border-zinc-400/30 bg-gradient-to-r from-zinc-500/70 via-zinc-500/50 to-zinc-500/30 dark:from-zinc-500/70 dark:via-zinc-500/50 dark:to-zinc-500/30 text-white shadow-[0_15px_35px_rgba(0,0,0,0.45)] backdrop-blur-sm transition duration-200 hover:border-zinc-300/40 hover:from-zinc-500/80 hover:via-zinc-500/60 hover:to-zinc-500/40 dark:hover:border-zinc-300/40 dark:hover:from-zinc-500/80 dark:hover:via-zinc-500/60 dark:hover:to-zinc-500/40 hover:shadow-[0_20px_45px_rgba(0,0,0,0.6)] disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create User"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

