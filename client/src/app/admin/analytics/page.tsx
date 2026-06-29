"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import dynamic from "next/dynamic";

const RevenueChart = dynamic(() => import("../../../components/analytics-charts").then((mod) => mod.RevenueChart), { ssr: false });
const RolesChart = dynamic(() => import("../../../components/analytics-charts").then((mod) => mod.RolesChart), { ssr: false });
const UtilizationChart = dynamic(() => import("../../../components/analytics-charts").then((mod) => mod.UtilizationChart), { ssr: false });
import {
  ShieldCheck, ArrowLeft, RefreshCw, TrendingUp, Users, DollarSign,
  Activity, Award, Clock, Wrench, ShieldAlert, Sparkles, PieChartIcon, BarChart2
} from "lucide-react";

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AnalyticsData {
  cards: {
    totalUsers: number;
    activeRentals: number;
    pendingRequests: number;
    revenue: number;
  };
  userDistribution: Array<{ name: string; value: number }>;
  customerRetentionRate: number;
  monthlyRevenue: Array<{ month: string; Revenue: number; Rentals: number }>;
  productUtilization: Array<{ category: string; Rented: number; Total: number; Utilization: number }>;
  avgMaintenanceResolutionHours: number;
}

const PIE_COLORS = ["#3b82f6", "#10b981", "#a855f7"];

export default function AdminAnalytics() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = React.useState<UserData | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchAnalytics = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ success: boolean; data: AnalyticsData }>("/analytics/admin");
      if (res.success && res.data) {
        setData(res.data);
      } else {
        throw new Error("Failed to retrieve valid analytics response");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to compile platform metrics. Check that database collections are populated.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("rentease_user");
    const token = localStorage.getItem("rentease_token");

    if (!stored || !token) {
      router.push("/login");
      return;
    }

    const parsed = JSON.parse(stored) as UserData;
    if (parsed.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    setCurrentUser(parsed);
    fetchAnalytics();
  }, [router, fetchAnalytics]);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card border border-border/60 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="p-2.5 rounded-xl border border-border/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-500 hover:text-neutral-700 dark:hover:text-white"
              title="Return to Dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">Analytics & Metrics Insights</h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                  <ShieldCheck className="h-3 w-3" />
                  Live Platform Audit
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">Deep-dive performance graphs, category utilization, and user retention metrics.</p>
            </div>
          </div>
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="self-start sm:self-center flex items-center gap-2 px-4 py-2 border border-border/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl text-xs font-semibold text-muted-foreground disabled:opacity-50 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
        </div>

        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-3">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-neutral-400 font-bold animate-pulse">Running metrics aggregations on Database...</p>
          </div>
        ) : error || !data ? (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl p-6 text-center text-xs text-red-650 dark:text-red-400 max-w-lg mx-auto space-y-4">
            <ShieldAlert className="h-10 w-10 mx-auto text-red-400" />
            <div>
              <p className="font-bold text-sm">Aggregations Failed</p>
              <p className="mt-1">{error || "No analytics data received."}</p>
            </div>
            <button
              onClick={fetchAnalytics}
              className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-550 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-200">

            {}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card border border-border/60 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400">
                  <DollarSign className="h-5.5 w-5.5" />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-foreground">₹{data.cards.revenue.toLocaleString("en-IN")}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold">Total Revenue</p>
                </div>
              </div>

              <div className="bg-card border border-border/60 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 dark:bg-emerald-955/20 text-emerald-600 dark:text-emerald-400">
                  <Activity className="h-5.5 w-5.5" />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-foreground">{data.cards.activeRentals}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold">Active Agreements</p>
                </div>
              </div>

              <div className="bg-card border border-border/60 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 bg-violet-50 dark:bg-violet-955/20 text-violet-600 dark:text-violet-400">
                  <Award className="h-5.5 w-5.5" />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-foreground">{data.customerRetentionRate}%</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold">Customer Retention</p>
                </div>
              </div>

              <div className="bg-card border border-border/60 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 bg-amber-50 dark:bg-amber-955/20 text-amber-600 dark:text-amber-400">
                  <Clock className="h-5.5 w-5.5" />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-foreground">{data.avgMaintenanceResolutionHours} hrs</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold">Maintenance Speed</p>
                </div>
              </div>
            </div>

            {}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {}
              <div className="bg-card border border-border/60 rounded-2xl p-6 lg:col-span-2 space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-indigo-550" />
                  <h3 className="font-extrabold text-neutral-800 dark:text-white text-sm">Monthly Revenue Trends & Volume</h3>
                </div>

                {mounted && <RevenueChart data={data.monthlyRevenue} />}
              </div>

              {}
              <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-violet-550" />
                  <h3 className="font-extrabold text-neutral-800 dark:text-white text-sm">Account Roles Distribution</h3>
                </div>

                {mounted && <RolesChart data={data.userDistribution} />}

                <div className="grid grid-cols-3 gap-2 text-[10px] text-center pt-2">
                  {data.userDistribution.map((role, index) => (
                    <div key={role.name} className="rounded-xl border border-neutral-100 dark:border-neutral-850 p-2 bg-neutral-50/50 dark:bg-neutral-950/20">
                      <p className="font-bold uppercase tracking-wider" style={{ color: PIE_COLORS[index] }}>{role.name}</p>
                      <p className="font-extrabold text-neutral-850 dark:text-white text-sm mt-0.5">{role.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {}
              <div className="bg-card border border-border/60 rounded-2xl p-6 lg:col-span-3 space-y-4">
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-extrabold text-neutral-800 dark:text-white text-sm">Product Category Utilization Rates</h3>
                </div>

                {mounted && <UtilizationChart data={data.productUtilization} />}

                <div className="p-4 border border-dashed border-border/60 rounded-xl bg-neutral-50/20 dark:bg-neutral-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-neutral-800 dark:text-white flex items-center gap-1">
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      About Stock Utilization Rate
                    </p>
                    <p className="text-neutral-500 text-[11px]">Utilization = (Active rented units in category) / (Total supply stock inside category catalog). Higher utilization shows strong category demand.</p>
                  </div>
                  <div className="flex flex-wrap gap-4 shrink-0 font-semibold text-muted-foreground">
                    {data.productUtilization.map(u => (
                      <div key={u.category}>
                        <span>{u.category}: </span>
                        <strong className="text-foreground">{u.Rented}/{u.Total}</strong>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
