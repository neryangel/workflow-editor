"use client";

import { useMemo } from "react";

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

// Pre-computed widths to avoid Math.random during render
const LINE_WIDTHS = [85, 92, 78, 88, 75, 95, 82, 90, 77, 87];

export function LoadingSkeleton({
  className = "",
  lines = 1,
}: LoadingSkeletonProps) {
  const widths = useMemo(
    () =>
      Array.from({ length: lines }).map(
        (_, i) => LINE_WIDTHS[i % LINE_WIDTHS.length],
      ),
    [lines],
  );

  return (
    <div className={`animate-pulse ${className}`}>
      {widths.map((width, i) => (
        <div
          key={i}
          className="h-4 bg-slate-700 rounded mb-2 last:mb-0"
          style={{ width: `${width}%` }}
        />
      ))}
    </div>
  );
}

export function NodeSkeleton() {
  return (
    <div className="w-64 bg-slate-800 rounded-xl p-4 animate-pulse">
      <div className="h-5 bg-slate-700 rounded w-24 mb-4" />
      <div className="h-20 bg-slate-700 rounded mb-3" />
      <div className="h-8 bg-slate-700 rounded" />
    </div>
  );
}

export function CanvasSkeleton() {
  return (
    <div className="flex-1 bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-800 animate-pulse" />
        <div className="h-4 w-32 bg-slate-800 rounded animate-pulse mx-auto" />
      </div>
    </div>
  );
}
