import React from "react";
import type { Movie } from "../../../../types/tierlist";
import { TIERS } from "../../constants/tier-constants";

interface RankMovieModalProps {
  movie: Movie | null;
  onClose: () => void;
  onRank: (tierId: string) => void;
}

export default function RankMovieModal({
  movie,
  onClose,
  onRank,
}: RankMovieModalProps): React.ReactElement | null {
  if (!movie) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-end"
      onClick={onClose} // Close modal on overlay click
    >
      <div
        className="bg-gray-800 w-full max-w-md rounded-t-lg p-4"
        onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
      >
        <h3 className="text-lg font-semibold text-white mb-4 text-center">
          Rank "{movie.title}"
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {TIERS.map((tier) => (
            <button
              key={tier.id}
              onClick={() => onRank(tier.id)}
              className={`p-4 rounded text-white font-bold text-xl ${tier.colorClass}`}
            >
              {tier.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
