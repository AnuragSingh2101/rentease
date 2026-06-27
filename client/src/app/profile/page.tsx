"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { updatePasswordSchema, type UpdatePasswordFormData } from "@/lib/validations/auth";
import { User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = React.useState<UserData | null>(null);
  const [pwSuccess, setPwSuccess] = React.useState(false);
  const [pwError, setPwError] = React.useState<string | null>(null);
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
  });

  React.useEffect(() => {
    const stored = localStorage.getItem("rentease_user");
    const token = localStorage.getItem("rentease_token");
    if (!stored || !token) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(stored));
  }, [router]);

  const getDashboardLink = () => {
    if (!user) return "/";
    if (user.role === "admin") return "/admin/dashboard";
    if (user.role === "vendor") return "/vendor/dashboard";
    return "/dashboard";
  };

  const onChangePassword = async (data: UpdatePasswordFormData) => {
    setPwError(null);
    setPwSuccess(false);
    try {
      await api.put("/auth/updatepassword", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setPwSuccess(true);
      reset();
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Failed to update password.");
    }
  };

  const inputBase =
    "w-full py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 text-sm text-foreground transition-colors";

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {}
        <Link href={getDashboardLink()} className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {}
        <div className="bg-card border border-border/60 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{user.name}</h1>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {user.role}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wide">Account Details</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                <User className="h-4 w-4 text-neutral-400 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Full Name</p>
                  <p className="text-sm font-semibold text-foreground">{user.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                <Mail className="h-4 w-4 text-neutral-400 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Email Address</p>
                  <p className="text-sm font-semibold text-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                <Phone className="h-4 w-4 text-neutral-400 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone Number</p>
                  <p className="text-sm font-semibold text-foreground">{user.phone || "Not set"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="bg-card border border-border/60 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Change Password</h2>
          </div>

          {pwSuccess && (
            <div className="mb-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-xl p-3.5 flex items-center gap-2.5 text-sm text-green-700 dark:text-green-400">
              <CheckCircle className="h-5 w-5 shrink-0" />
              Password updated successfully!
            </div>
          )}

          {pwError && (
            <div className="mb-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-3.5 flex items-start gap-2.5 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              {pwError}
            </div>
          )}

          <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
            {}
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-400 uppercase">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  {...register("currentPassword")}
                  type={showCurrent ? "text" : "password"}
                  placeholder="Your current password"
                  className={`${inputBase} pl-10 pr-10 focus:border-indigo-500 focus:outline-none`}
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.currentPassword && <p className="text-xs text-red-500 mt-1">{errors.currentPassword.message}</p>}
            </div>

            {}
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-400 uppercase">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  {...register("newPassword")}
                  type={showNew ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  className={`${inputBase} pl-10 pr-10 focus:border-indigo-500 focus:outline-none`}
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword.message}</p>}
            </div>

            {}
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-400 uppercase">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  {...register("confirmPassword")}
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat new password"
                  className={`${inputBase} pl-10 pr-10 focus:border-indigo-500 focus:outline-none`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
