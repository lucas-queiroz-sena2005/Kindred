import React, { useState } from "react";
import type { TierState, Movie } from "../../../types/tierlist";
import { TIERS, TIER_ORDER } from "../constants/tier-constants";
import SimpleTierRow from "./SimpleTierRow";

interface TierlistTapProps {
  tierState: TierState;
  setTierState: (updater: (state: TierState) => TierState) => void;
}

export default function TierlistTap({
  tierState,
  setTierState,
}: TierlistTapProps) {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  // Moves the selected movie to the chosen tier
  const handleRankMovie = (destinationTierId: string) => {
    if (!selectedMovie) return;

    setTierState((current) => {
      const newState = JSON.parse(JSON.stringify(current)) as TierState;
      newState.unranked.items = newState.unranked.items.filter(
        (m) => m.id !== selectedMovie.id
      );
      newState[destinationTierId].items.push(selectedMovie);
      return newState;
    });

    setSelectedMovie(null);
  };

  return (
    <div>
      {TIER_ORDER.filter((id) => id !== "unranked").map((tierId) =>
        tierState[tierId] ? <SimpleTierRow key={tierId} tier={tierState[tierId]} /> : null
      )}

      <div className="unranked-container mt-4">
        <h2 className="text-xl font-bold mb-2">Unranked</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {tierState.unranked?.items.map((movie) => (
            <button
              key={movie.id}
              onClick={() => setSelectedMovie(movie)}
              className="aspect-[2/3] bg-gray-700 rounded overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 relative group"
            >
              <img src={movie.poster_path || ""} alt={movie.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-sm p-2 text-center">Tap to rank</div>
            </button>
          ))}
        </div>
      </div>

      {selectedMovie && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end"
          onClick={() => setSelectedMovie(null)} // Close modal on overlay click
        >
          <div
            className="bg-gray-800 w-full max-w-md rounded-t-lg p-4"
            onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
          >
            <h3 className="text-lg font-semibold text-white mb-4 text-center">Rank "{selectedMovie.title}"</h3>
            <div className="grid grid-cols-3 gap-2">
              {TIERS.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => handleRankMovie(tier.id)}
                  className={`p-4 rounded text-white font-bold text-xl ${tier.colorClass}`}
                >
                  {tier.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
