import React from "react";

export function ConversationListItemSkeleton(): React.ReactElement {
  return (
    <div className="p-4">
      <div className="h-6 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
    </div>
  );
}
