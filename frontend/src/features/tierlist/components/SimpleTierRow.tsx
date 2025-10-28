import React from "react";
import type { Tier } from "../../../types/tierlist";
import { TIERS, UNRANKED_TIER } from "../constants/tier-constants";

interface SimpleTierRowProps {
  tier: Tier;
}

// Define the map outside the component so it's created only once for efficiency.
const TIER_METADATA_MAP = Object.fromEntries([...TIERS, UNRANKED_TIER].map(t => [t.id, t]));

export default function SimpleTierRow({ tier }: SimpleTierRowProps) {
  const tierMetadata = TIER_METADATA_MAP[tier.id];
  const tierColorClass = tierMetadata?.colorClass || "bg-gray-700";

  return (
    <div className="flex items-stretch min-h-[100px] mb-1 border border-gray-700 rounded">
      <div className={`flex items-center justify-center w-24 text-white font-bold text-xl ${tierColorClass}`}>
        {tier.title}
      </div>
      <div className="flex-1 bg-gray-700 p-2 flex items-center gap-2 overflow-x-auto">
        {tier.items.map((item) => (
          <div key={item.id} className="w-20 h-28 flex-shrink-0 bg-gray-800 rounded overflow-hidden">
            <img src={item.poster_path || ""} alt={item.title} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}