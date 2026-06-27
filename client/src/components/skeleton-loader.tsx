"use client";

import * as React from "react";

export function SkeletonListingCard() {
  return (
    <div className="saas-card overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-muted" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-2/3 bg-muted rounded-lg" />
        <div className="h-3 w-1/2 bg-muted rounded-lg" />
        <div className="flex justify-between items-center pt-3 border-t border-border/60">
          <div className="h-4 w-1/3 bg-muted rounded-lg" />
          <div className="h-4 w-1/5 bg-muted rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonProductCard() {
  return (
    <div className="saas-card animate-pulse flex flex-col justify-between h-[360px] p-5 space-y-4">
      <div className="space-y-4">
        <div className="h-5 w-1/4 bg-muted rounded-full" />
        <div className="h-32 w-full bg-muted rounded-xl" />
        <div className="h-5 w-3/4 bg-muted rounded-lg" />
      </div>
      <div className="space-y-3 pt-3 border-t border-border/60">
        <div className="flex justify-between items-center">
          <div className="h-4 w-1/3 bg-muted rounded-lg" />
          <div className="h-3.5 w-1/4 bg-muted rounded-lg" />
        </div>
        <div className="h-9 w-full bg-muted rounded-xl" />
      </div>
    </div>
  );
}
