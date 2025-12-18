import React from "react";
import { Link } from "react-router-dom";
import type { TierListSummary } from "../types/tierlist";
import { TemplateCardSkeleton } from "./TemplateCardSkeleton";

export function TemplateCard(templateData: TierListSummary): React.ReactElement {
  const { id, title, description, isRanked, updatedAt } = templateData;

  function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <Link
      to={`/tierlists/${id}`}
      className="hover:shadow-md"
      aria-label={isRanked ? `View your ranking for ${title}` : `Rank now: ${title}`}
    >
      <TemplateCardSkeleton>
        <div className="p-4 flex-grow">
          <h3 className="font-bold text-neutral-800 dark:text-neutral-100 line-clamp-2">
            {title}
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1 line-clamp-3">
            {description}
          </p>
        </div>

        <div className="p-4 bg-neutral-50/75 dark:bg-neutral-950/40 border-t border-neutral-200/80 dark:border-neutral-800 rounded-b-lg flex flex-col justify-end">
          {updatedAt && (
            <div className="flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400 mb-3">
              <span>Last updated</span>
              <span>{formatDate(updatedAt)}</span>
            </div>
          )}

          <div
            className={`w-full text-center font-semibold py-2 px-4 rounded-md text-sm ${
              isRanked
                ? "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                : "bg-purple-600 text-white"
            }`}
          >
            {isRanked ? "Edit Ranking" : "Rank Now"}
          </div>
        </div>
      </TemplateCardSkeleton>
    </Link>
  );
}
