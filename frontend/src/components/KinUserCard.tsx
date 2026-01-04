import React from "react";
import type { CompareDetails, KinUser } from "../types/kin";

interface KinUserCardProps {
  user: KinUser;
  isOpen: boolean;
  onToggle: () => void;
  details?: CompareDetails | null;
  isLoading: boolean;
  isError: boolean;
}

export function KinUserCard({
  user,
  isOpen,
  onToggle,
  details,
  isLoading,
  isError,
}: KinUserCardProps): React.ReactElement {
  const percentage = (user.similarityScore * 100).toFixed(1);

  const overallScore = ((details?.overallScore ?? 0) * 100).toFixed(1);

  const dynamicSegments = details?.segments
    ? Object.entries(details.segments).reduce(
        (acc, [key, val]) => {
          const label =
            key.replace("Score", "").charAt(0).toUpperCase() +
            key.replace("Score", "").slice(1);
          acc[label] = ((val ?? 0) * 100).toFixed(1);
          return acc;
        },
        {} as Record<string, string>,
      )
    : {};

  const fixedDetails = {
    Overall: overallScore,
    ...dynamicSegments,
  };
  console.log(fixedDetails);

  return (
    <article
      onClick={onToggle}
      className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200 hover:shadow-md transition-shadow flex justify-between items-center"
    >
      <div>
        <h3 className="font-bold text-lg text-neutral-800">{user.username}</h3>
        <p className="text-sm text-neutral-500">Usuário compatível</p>
      </div>

      <div className="text-right">
        <span className="block text-2xl font-bold text-purple-600">
          {percentage}%
        </span>
        <span className="text-xs text-neutral-400 uppercase tracking-wide">
          Afinidade
        </span>
      </div>
      {isOpen && (
        <div className="animate-in fade-in slide-in-from-top-1">
          {isLoading && <p>Loading...</p>}
          {isError && <p>Error while loading comparasion details.</p>}
          {details &&
            fixedDetails &&
            !isLoading &&
            !isError &&
            Object.entries(fixedDetails).map(([label, score]) => (
              <>
                <label key={label}>{label}:</label>
                <span
                  key={label}
                  className="block text-2xl font-bold text-purple-600"
                >
                  {score}%
                </span>
              </>
            ))}
        </div>
      )}
    </article>
  );
}
