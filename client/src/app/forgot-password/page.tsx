"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations/auth";
import { Mail, Home, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setServerError(null);
    try {
      await api.post("/auth/forgotpassword", { email: data.email });
      setSuccess(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
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
            Forgot your password?
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {/* Success State */}
        {success ? (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-xl p-4 flex items-start gap-3 text-sm text-green-700 dark:text-green-400">
              <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Reset link sent!</p>
                <p className="mt-1">
                  If that email is registered with us, you&apos;ll receive a password reset link shortly. Check your inbox and spam folder.
                </p>
              </div>
            </div>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm font-medium text-indigo-600 dark:text-violet-400 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            {/* Server Error */}
            {serverError && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-3.5 flex items-start gap-2.5 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-neutral-400 uppercase">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:border-indigo-500 focus:outline-none dark:text-white transition-colors"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 dark:bg-violet-600 dark:hover:bg-violet-500 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-md shadow-indigo-500/10"
              >
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
              <Link
                href="/login"
                className="font-semibold text-indigo-600 dark:text-violet-400 hover:underline flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
