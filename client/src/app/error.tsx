"use client";

import * as React from "react";
import { ShieldAlert, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("ErrorBoundary captured client crash:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
      <div className="bg-card border border-border/60 p-8 rounded-3xl text-center max-w-md w-full shadow-xl space-y-5">
        <div className="h-14 w-14 rounded-2xl bg-red-50 dark:bg-red-955/20 text-red-655 dark:text-red-400 flex items-center justify-center mx-auto border border-red-100 dark:border-red-900">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-extrabold text-foreground">Something Went Wrong</h2>
          <p className="text-xs text-neutral-500">
            An unexpected error occurred during execution. We've logged this internally.
          </p>
        </div>
        {error.message && (
          <div className="bg-neutral-50 dark:bg-neutral-950 p-3 rounded-xl border border-neutral-100 dark:border-neutral-850 text-left">
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Error Details</p>
            <p className="text-xs text-neutral-600 dark:text-neutral-450 mt-0.5 font-mono overflow-x-auto break-all">
              {error.message}
            </p>
          </div>
        )}
        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={() => (window.location.href = "/")}
            className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-750 font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 border border-neutral-250/50"
          >
            <Home className="h-4 w-4" />
            Home
          </button>
          <button
            onClick={reset}
            className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/10 border-none"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
