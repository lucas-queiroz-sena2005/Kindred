import React from "react";

interface TemplateCardSkeletonProps {
  children?: React.ReactNode;
}

export function TemplateCardSkeleton({
  children,
}: TemplateCardSkeletonProps): React.ReactElement {
  const content = children ? (
    children
  ) : (
    <>
      <div className="p-4 flex-grow">
        <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4 mb-3 animate-pulse"></div>
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-full mb-2 animate-pulse"></div>
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-5/6 animate-pulse"></div>
      </div>

      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-full animate-pulse"></div>
      </div>
    </>
  );

  return (
    <div className="h-60 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm flex flex-col overflow-hidden transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-lg">
      {content}
    </div>
  );
}
