import React, { useState } from "react";
import type { TierState, Movie } from "../../../../types/tierlist";
import { TIER_ORDER } from "../../constants/tier-constants";
import SimpleTierRow from "./SimpleTierRow";
import RankMovieModal from "./RankMovieModal";

// Define the map outside the component so it's created only once for efficiency.
interface TierlistTapProps {
  tierState: TierState;
  setTierState: (updater: (state: TierState) => TierState) => void;
  onMovieSelect?: (movie: Movie) => void;
}

export default function TierlistTap({
  tierState,
  setTierState,
  onMovieSelect,
}: TierlistTapProps): React.ReactElement {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  /**
   * Moves the selected movie from its current tier to the destination tier.
   * @param destinationTierId The ID of the tier to move the movie to.
   */
  const handleRankMovie = (destinationTierId: string) => {
    if (!selectedMovie) return;

    setTierState((current) => {
      // Deep copy to avoid direct state mutation
      const newState = JSON.parse(JSON.stringify(current)) as TierState;

      // Remove the movie from whichever tier it's currently in.
      for (const tierId in newState) {
        newState[tierId].items = newState[tierId].items.filter(
          (m) => m.id !== selectedMovie.id
        );
      }

      // Add the movie to the destination tier
      newState[destinationTierId].items.push(selectedMovie);
      console.log(newState)
      return newState;
    });

    setSelectedMovie(null);
  };
  
  const handleSelect = (movie: Movie) => {
    setSelectedMovie(movie);
    if (onMovieSelect) {
      onMovieSelect(movie);
    }
  };

  return (
    <div>
      {/* Display all tiers, including unranked, using SimpleTierRow */}
      {TIER_ORDER.map((tierId) =>
        tierState[tierId] ? (
          <SimpleTierRow
            key={tierId}
            tier={tierState[tierId]}
            onSelectMovie={handleSelect}
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
