"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import {
  User, Mail, Lock, Phone, Home, ArrowRight, AlertCircle,
  ShoppingBag, Store, Eye, EyeOff,
} from "lucide-react";

const roles = [
  {
    value: "customer" as const,
    label: "Customer",
    description: "Browse & rent properties",
    icon: ShoppingBag,
  },
  {
    value: "vendor" as const,
    label: "Vendor",
    description: "List & manage properties",
    icon: Store,
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "customer" },
  });

  const selectedRole = watch("role");

  React.useEffect(() => {
    if (localStorage.getItem("rentease_token")) router.push("/");
  }, [router]);

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      interface RegisterResponse {
        token: string;
        user: { _id: string; name: string; email: string; role: string };
      }
      const res = await api.post<RegisterResponse>("/auth/register", {
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        password: data.password,
        role: data.role,
      });
      localStorage.setItem("rentease_token", res.token);
      localStorage.setItem("rentease_user", JSON.stringify(res.user));
      document.cookie = `token=${res.token}; path=/; max-age=604800; SameSite=Lax`;
      window.dispatchEvent(new Event("auth-change"));
      // Redirect based on role
      if (res.user.role === "vendor") router.push("/vendor/dashboard");
      else router.push("/dashboard");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Failed to register. Please try again.");
    }
  };

  const inputBase =
    "w-full py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:border-indigo-500 focus:outline-none dark:text-white transition-colors";

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(30rem_30rem_at_center,var(--color-indigo-100),white)] dark:bg-[radial-gradient(30rem_30rem_at_center,var(--color-neutral-900),var(--color-neutral-950))] opacity-35" />

      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md mx-auto">
            <Home className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Create your account
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Join RentEase as a customer or vendor
          </p>
        </div>

        {serverError && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-3.5 flex items-start gap-2.5 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Role Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map(({ value, label, description, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue("role", value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                    selectedRole === value
                      ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-600 dark:text-violet-400"
                      : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                  <span className={`text-[10px] font-normal ${selectedRole === value ? "text-indigo-500 dark:text-violet-400" : "text-neutral-400"}`}>
                    {description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-400 uppercase">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input {...register("name")} type="text" placeholder="John Doe" className={`${inputBase} pl-10 pr-4`} />
            </div>
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-400 uppercase">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input {...register("email")} type="email" placeholder="you@example.com" className={`${inputBase} pl-10 pr-4`} />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-400 uppercase">
              Phone <span className="text-neutral-400 normal-case font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input {...register("phone")} type="tel" placeholder="+91 98765 43210" className={`${inputBase} pl-10 pr-4`} />
            </div>
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-400 uppercase">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="Min. 6 characters" className={`${inputBase} pl-10 pr-10`} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-400 uppercase">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input {...register("confirmPassword")} type={showConfirm ? "text" : "password"} placeholder="Repeat your password" className={`${inputBase} pl-10 pr-10`} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-500 dark:bg-violet-600 dark:hover:bg-violet-500 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-md shadow-indigo-500/10 mt-2"
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
            {!isSubmitting && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-indigo-600 dark:text-violet-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
