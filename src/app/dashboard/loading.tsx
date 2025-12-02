"use client";

import { Skeleton } from "@/components/ui/skeleton";

const LinkCardSkeleton = () => (
  <div className="flex items-center gap-4 bg-white shadow rounded p-3 animate-pulse">
    <div className="flex items-center gap-3">
      <Skeleton className="h-8 w-6 rounded" />
      <Skeleton className="w-20 h-20 rounded" />
    </div>

    <div className="flex-1 min-w-0 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 w-full">
          <Skeleton className="h-5 w-3/4" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>

      <Skeleton className="h-3 w-1/3 mt-2" />
    </div>
  </div>
);

export default function LoadingLinks() {
  return (
    <div className="min-h-screen p-6 bg-slate-50 text-slate-900">
      <div className="max-w-5xl mx-auto">
        {/* Header skeleton */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>

          <div className="flex gap-3">
            <Skeleton className="h-10 w-24 rounded" />
            <Skeleton className="h-10 w-24 rounded" />
            <Skeleton className="h-10 w-24 rounded" />
          </div>
        </header>

        {/* List skeleton */}
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <LinkCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
