"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { Mail, Lock, Home, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  React.useEffect(() => {
    if (localStorage.getItem("rentease_token")) {
      router.push("/");
    }
  }, [router]);

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      interface LoginResponse {
        token: string;
        user: { _id: string; name: string; email: string; role: string };
      }
      const res = await api.post<LoginResponse>("/auth/login", data);

      localStorage.setItem("rentease_token", res.token);
      localStorage.setItem("rentease_user", JSON.stringify(res.user));
      document.cookie = `token=${res.token}; path=/; max-age=604800; SameSite=Lax`;
      window.dispatchEvent(new Event("auth-change"));
      // Redirect based on role
      if (res.user.role === "admin") router.push("/admin/dashboard");
      else if (res.user.role === "vendor") router.push("/vendor/dashboard");
      else router.push("/dashboard");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Failed to log in. Please check your credentials.");
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
            Welcome back
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Sign in to access your RentEase account
          </p>
        </div>

        {/* Server Error */}
        {serverError && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-3.5 flex items-start gap-2.5 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
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

          {/* Password */}
          <div className="space-y-1 text-left">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-neutral-400 uppercase">Password</label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-indigo-600 dark:text-violet-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-500 dark:bg-violet-600 dark:hover:bg-violet-500 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-md shadow-indigo-500/10"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
            {!isSubmitting && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-indigo-600 dark:text-violet-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
