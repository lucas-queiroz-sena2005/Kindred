import React from "react";

export function KinUserCardSkeleton(): React.ReactElement {
  return (
    <article className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
      <div>
        <div className="h-7 w-32 bg-neutral-200 dark:bg-neutral-600 rounded animate-pulse mb-2" />
        <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-600 rounded animate-pulse" />
      </div>
      <div className="flex flex-col items-end">
        <div className="h-8 w-16 bg-neutral-200 dark:bg-neutral-600 rounded animate-pulse mb-1" />
        <div className="h-3 w-12 bg-neutral-200 dark:bg-neutral-600 rounded animate-pulse" />
      </div>
    </article>
  );
}