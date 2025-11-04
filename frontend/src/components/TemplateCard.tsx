import React from "react";
import { Link } from "react-router-dom";
import type { TierListSummary } from "../types/tierlist";

export function TemplateCard(
  templateData: TierListSummary
): React.ReactElement {
  const { id, title, description, isRanked, updatedAt } = templateData;

  const cardClasses = [
    "block",
    "border",
    "rounded-lg",
    "hover:shadow-md",
    "transition-all",
    "duration-200",
    "flex",
    "flex-col",
    "h-full",
    isRanked ? "bg-white" : "bg-white",
  ].join(" ");

  return (
    <Link
      to={`/tierlists/${id}`}
      className={cardClasses}
      aria-label={isRanked ? `View your ranking for ${title}` : `Rank now: ${title}`}
    >
      <div className="p-4 flex-grow">
        <h3 className="font-bold text-neutral-800">{title}</h3>
        <p className="text-sm text-neutral-600 mt-1">{description}</p>
      </div>
      <div className="p-4 bg-neutral-50/75 border-t border-neutral-200/80 rounded-b-lg">
        <div className={`w-full text-center font-semibold py-2 px-4 rounded-md text-sm ${isRanked ? 'bg-neutral-200 text-neutral-700' : 'bg-purple-600 text-white'}`}>
          {isRanked ? "Edit Ranking" : "Rank Now"}
        </div>
      </div>
    </Link>
  );
}
