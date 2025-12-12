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
        <div className="h-6 w-3/4 bg-neutral-200 rounded animate-pulse mb-3"></div>
        <div className="h-4 w-full bg-neutral-200 rounded animate-pulse mb-1"></div>
        <div className="h-4 w-5/6 bg-neutral-200 rounded animate-pulse"></div>
      </div>
      <div className="p-4 bg-neutral-50/75 border-t border-neutral-200/80 rounded-b-lg flex flex-col justify-end">
        <div className="flex justify-between items-center text-xs text-neutral-500 mb-3">
          <div className="h-3 w-1/4 bg-neutral-200 rounded animate-pulse"></div>
          <div className="h-3 w-1/3 bg-neutral-200 rounded animate-pulse"></div>
        </div>
        <div className="h-9 w-full bg-neutral-200 rounded-md animate-pulse"></div>
      </div>
    </>
  );

  return (
    <div className="flex flex-col h-72 border rounded-lg bg-white transition-all duration-200">
      {content}
    </div>
  );
}