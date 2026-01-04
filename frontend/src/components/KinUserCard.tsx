import React from "react";
import { Link } from "react-router-dom";
import type { CompareDetails, KinUser } from "../types/kin";
import { KinMessaging } from "./KinMessaging";
import ErrorMessage from "./ErrorMessage";

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
      className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200 hover:shadow-md transition-shadow h-fit cursor-pointer"
      onClick={onToggle}
    >
      <article className="flex justify-between items-start">
        <div className="flex-grow">
          <h3 className="font-bold text-lg text-neutral-800">
            {user.username}
          </h3>
          <p className="text-sm text-neutral-500">Usuário compatível</p>
          <div className="mt-4 pt-4 border-t border-neutral-100">
            <div className="flex items-center gap-2">
              <button
                onClick={handleDetailsClick}
                className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300 z-10 relative"
              >
                {isOpen ? "Close" : "Details"}
              </button>
              <button
                onClick={handleButtonClick}
                className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300 z-10 relative"
              >
                {isMessageOpen ? "Cancel" : "Quick Message"}
              </button>
              <Link
                to={`/messages/${user.id}`}
                state={{ targetUser: user }}
                onClick={(e) => e.stopPropagation()}
                className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 z-10 relative"
              >
                Go to Messages
              </Link>
            </div>
            {isMessageOpen && <KinMessaging targetId={user.id} />}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <span className="block text-2xl font-bold text-purple-600">
            {percentage}%
          </span>
          <span className="text-xs text-neutral-400 uppercase tracking-wide">
            Afinidade
          </span>
        </div>
      </article>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-neutral-200 animate-in fade-in slide-in-from-top-1">
          {isLoading && <p className="text-center">Loading details...</p>}
          {isError && (
            <ErrorMessage message="Error while loading comparison details." />
          )}
          {details && fixedDetails && !isLoading && !isError && (
            <div className="flex justify-around text-center">
              {Object.entries(fixedDetails).map(([label, score]) => (
                <div key={label}>
                  <span className="block text-xl font-bold text-purple-600">
                    {score}%
                  </span>
                  <span className="text-xs text-neutral-500 uppercase">
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
