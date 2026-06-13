"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validations/auth";
import { Lock, Home, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [serverError, setServerError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setServerError(null);
    try {
      interface ResetResponse {
        token: string;
        user: { _id: string; name: string; email: string; role: string };
      }
      const res = await api.put<ResetResponse>(`/auth/resetpassword/${token}`, {
        password: data.password,
      });

      // Auto-login after reset
      localStorage.setItem("rentease_token", res.token);
      localStorage.setItem("rentease_user", JSON.stringify(res.user));
      window.dispatchEvent(new Event("auth-change"));

      setSuccess(true);
      setTimeout(() => router.push("/"), 2000);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Reset failed. The link may have expired.");
    }
  };

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(30rem_30rem_at_center,var(--color-indigo-100),white)] dark:bg-[radial-gradient(30rem_30rem_at_center,var(--color-neutral-900),var(--color-neutral-950))] opacity-35" />

      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md mx-auto">
            <Home className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Reset your password
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Enter your new password below.
          </p>
        </div>

        {/* Success */}
        {success ? (
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-xl p-4 flex items-start gap-3 text-sm text-green-700 dark:text-green-400">
            <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Password reset successfully!</p>
              <p className="mt-1">You are now logged in. Redirecting...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Server Error */}
            {serverError && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-3.5 flex items-start gap-2.5 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <span>{serverError}</span>
                  <Link href="/forgot-password" className="block mt-1 font-semibold underline">
                    Request a new reset link
                  </Link>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* New Password */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-neutral-400 uppercase">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:border-indigo-500 focus:outline-none dark:text-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-neutral-400 uppercase">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    {...register("confirmPassword")}
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat new password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:border-indigo-500 focus:outline-none dark:text-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 dark:bg-violet-600 dark:hover:bg-violet-500 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-md shadow-indigo-500/10"
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
