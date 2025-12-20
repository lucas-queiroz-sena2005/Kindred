import React from "react";

export function KinUserCardSkeleton(): React.ReactElement {
  return (
    <article className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200 flex justify-between items-center">
      <div>
        {/* Username placeholder */}
        <div className="h-7 w-32 bg-neutral-200 rounded animate-pulse mb-2" />
        {/* Subtitle placeholder */}
        <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse" />
      </div>

      <div className="flex flex-col items-end">
        {/* Percentage placeholder */}
        <div className="h-8 w-16 bg-neutral-200 rounded animate-pulse mb-1" />
        {/* Label placeholder */}
        <div className="h-3 w-12 bg-neutral-200 rounded animate-pulse" />
      </div>
    </article>
  );
}