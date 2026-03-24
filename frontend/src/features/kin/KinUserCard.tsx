import React from "react";
import { Link } from "react-router-dom";
import type { CompareDetails, KinUser } from "@/types/kin";
import { KinMessaging } from "@/features/messages/KinMessaging";
import ErrorMessage from "@/shared/ui/ErrorMessage";
import { getKinClassification } from "./kinClassification";
import { cn } from "@/shared/lib/cn";
import { tw } from "@/shared/lib/tw";

interface KinUserCardProps {
  user: KinUser;
  isOpen: boolean;
  onToggle: () => void;
  isMessageOpen: boolean;
  onMessageToggle: () => void;
  details?: CompareDetails | null;
  isLoading: boolean;
  isError: boolean;
}

export function KinUserCard({
  user,
  isOpen,
  onToggle,
  isMessageOpen,
  onMessageToggle,
  details,
  isLoading,
  isError,
}: KinUserCardProps): React.ReactElement {
  const classification = getKinClassification(user.similarityScore);
  const percentage = (user.similarityScore * 100).toFixed(1);

  const overallScore = ((details?.overallScore ?? 0) * 100).toFixed(1);

  const segmentLabel = (key: string) =>
    key.charAt(0).toUpperCase() + key.slice(1);

  const dynamicSegments = details?.segments
    ? Object.entries(details.segments).reduce(
        (acc, [key, val]) => {
          acc[segmentLabel(key)] = ((val ?? 0) * 100).toFixed(1);
          return acc;
        },
        {} as Record<string, string>,
      )
    : {};

  const fixedDetails = {
    Overall: overallScore,
    ...dynamicSegments,
  };

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle();
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMessageToggle();
  };

  return (
    <div
      className={cn(
        tw.card,
        "h-fit cursor-pointer p-6 shadow-sm transition-shadow hover:shadow-md",
      )}
      onClick={onToggle}
    >
      <article className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-grow">
          <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">
            {user.username}
          </h3>
          <p
            className="cursor-default text-sm font-medium text-purple-700 dark:text-purple-300"
            title={classification.tagline}
          >
            {classification.label}
          </p>
          <div className="mt-4 border-t border-neutral-100 pt-4 dark:border-neutral-700">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDetailsClick}
                className={cn(tw.btnSecondary, "relative z-10")}
              >
                {isOpen ? "Close" : "Details"}
              </button>
              <button
                type="button"
                onClick={handleButtonClick}
                className={cn(tw.btnSecondary, "relative z-10")}
              >
                {isMessageOpen ? "Cancel" : "Quick Message"}
              </button>
              <Link
                to={`/messages/${user.id}`}
                state={{ targetUser: user }}
                onClick={(e) => e.stopPropagation()}
                className={cn(tw.btnPrimary, "relative z-10 px-3 py-1 text-sm")}
              >
                Go to Messages
              </Link>
            </div>
            {isMessageOpen && <KinMessaging targetId={user.id} />}
          </div>
        </div>
        <div className="min-w-[4.5rem] flex-shrink-0 text-right">
          <span className="block text-2xl font-bold text-purple-600 dark:text-purple-400">
            {percentage}%
          </span>
          <span className="text-xs uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
            Affinity
          </span>
        </div>
      </article>

      {isOpen && (
        <div className="animate-in fade-in slide-in-from-top-1 mt-4 border-t border-neutral-200 pt-4 dark:border-neutral-700">
          {isLoading && (
            <p className="text-center text-neutral-600 dark:text-neutral-400">
              Loading details...
            </p>
          )}
          {isError && (
            <ErrorMessage message="Error while loading comparison details." />
          )}
          {details && fixedDetails && !isLoading && !isError && (
            <div className="flex justify-around text-center">
              {Object.entries(fixedDetails).map(([label, score]) => (
                <div key={label}>
                  <span className="block text-xl font-bold text-purple-600 dark:text-purple-400">
                    {score}%
                  </span>
                  <span className="text-xs uppercase text-neutral-500 dark:text-neutral-400">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
