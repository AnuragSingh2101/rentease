"use client";

import * as React from "react";

export function SkeletonListingCard() {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm animate-pulse space-y-4">
      {/* Image skeleton */}
      <div className="w-full h-48 bg-neutral-200 dark:bg-neutral-800" />
      
      <div className="p-5 space-y-3">
        {/* Title skeleton */}
        <div className="h-5 w-2/3 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
        
        {/* Location skeleton */}
        <div className="h-3.5 w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
        
        <div className="flex justify-between items-center pt-3 border-t border-neutral-100 dark:border-neutral-850">
          {/* Price skeleton */}
          <div className="h-4 w-1/3 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
          
          {/* Rating skeleton */}
          <div className="h-4 w-1/5 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonProductCard() {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-250/70 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm animate-pulse flex flex-col justify-between h-[360px] p-5 space-y-4">
      <div className="space-y-4">
        {/* Category tag skeleton */}
        <div className="h-5 w-1/4 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
        
        {/* Image gradient wrapper skeleton */}
        <div className="h-32 w-full bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
        
        {/* Title skeleton */}
        <div className="h-5 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
      </div>

      <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-850">
        <div className="flex justify-between items-center">
          {/* Price rent skeleton */}
          <div className="h-4 w-1/3 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
          {/* Stock units skeleton */}
          <div className="h-3.5 w-1/4 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
        </div>
        
        {/* Button link skeleton */}
        <div className="h-8.5 w-full bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
      </div>
    </div>
  );
}
