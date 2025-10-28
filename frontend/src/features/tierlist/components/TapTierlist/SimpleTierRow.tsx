import React from "react";
import type { Movie, Tier } from "../../../../types/tierlist";
import { TIERS, UNRANKED_TIER } from "../../constants/tier-constants";
import TappableMovieItem from "./TappableMovieItem";

interface SimpleTierRowProps {
  tier: Tier;
  onSelectMovie: (movie: Movie) => void;
}

// Define the map outside the component so it's created only once for efficiency.
const TIER_METADATA_MAP = Object.fromEntries([...TIERS, UNRANKED_TIER].map(t => [t.id, t]));

export default function SimpleTierRow({ tier, onSelectMovie }: SimpleTierRowProps) {
  const tierMetadata = TIER_METADATA_MAP[tier.id];
  const tierColorClass = tierMetadata?.colorClass || UNRANKED_TIER.colorClass; // Default to unranked color

  return (
    <div className="flex items-stretch min-h-[100px] mb-1 border border-gray-700 rounded">
      <div className={`flex items-center justify-center w-24 text-white font-bold text-xl ${tierColorClass}`}>
        {tier.title}
      </div>
      <div className="flex-1 bg-gray-700 p-2 flex items-center gap-2 overflow-x-auto min-h-[100px]">
        {tier.items.map((movie) => (
          <TappableMovieItem key={movie.id} movie={movie} onSelect={onSelectMovie} />
        ))}
      </div>
    </div>
  );
}