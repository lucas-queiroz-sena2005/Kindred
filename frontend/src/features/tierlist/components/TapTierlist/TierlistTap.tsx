import React, { useState } from "react";
import type { TierState, Movie } from "../../../../types/tierlist";
import { TIER_ORDER, TIERS, UNRANKED_TIER } from "../../constants/tier-constants";
import SimpleTierRow from "./SimpleTierRow";
import RankMovieModal from "./RankMovieModal";
import TappableMovieItem from "./TappableMovieItem"; // Import the new component

// Define the map outside the component so it's created only once for efficiency.
interface TierlistTapProps {
  tierState: TierState;
  setTierState: (updater: (state: TierState) => TierState) => void;
}

export default function TierlistTap({
  tierState,
  setTierState,
}: TierlistTapProps) {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  // Map for quick lookup of tier metadata (color, title)
  const TIER_METADATA_MAP = Object.fromEntries([...TIERS, UNRANKED_TIER].map(t => [t.id, t]));

  /**
   * Moves the selected movie from its current tier to the destination tier.
   * @param destinationTierId The ID of the tier to move the movie to.
   */
  const handleRankMovie = (destinationTierId: string) => {
    if (!selectedMovie) return;

    setTierState((current) => {
      // Deep copy to avoid direct state mutation
      const newState = JSON.parse(JSON.stringify(current)) as TierState;

      // Find the movie's current tier and remove it
      let foundAndRemoved = false;
      for (const tierId of TIER_ORDER) {
        if (newState[tierId]) {
          const initialLength = newState[tierId].items.length;
          newState[tierId].items = newState[tierId].items.filter(
            (m) => m.id !== selectedMovie.id
          );
          if (newState[tierId].items.length < initialLength) {
            foundAndRemoved = true;
            break; // Movie found and removed, no need to check other tiers
          }
        }
      }

      // Add the movie to the destination tier
      newState[destinationTierId].items.push(selectedMovie);
      return newState;
    });

    setSelectedMovie(null);
  };

  return (
    <div>
      {/* Display all tiers, including unranked, using SimpleTierRow */}
      {TIER_ORDER.map((tierId) =>
        tierState[tierId] ? (
          <SimpleTierRow
            key={tierId}
            tier={tierState[tierId]}
            onSelectMovie={setSelectedMovie}
          />
        ) : null
      )}
      {/* The modal for ranking a selected movie */}
      <RankMovieModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
        onRank={handleRankMovie}
      />
    </div>
  );
}
