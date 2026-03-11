import { Droppable } from "@hello-pangea/dnd";
import DataCard from "./Datacard";
import type { Tier, Movie } from "../../../../types/tierlist";
import { TIERS, UNRANKED_TIER } from "../../constants/tier-constants";
import { useTmdbConfig } from "../../../../context/TmdbConfigProvider";

const TIER_METADATA_MAP = Object.fromEntries(
  [...TIERS, UNRANKED_TIER].map((t) => [t.id, t])
);

interface TierDndProps {
  tier: Tier;
  onMovieSelect?: (movie: Movie) => void;
}

export default function TierDnd({ tier, onMovieSelect }: TierDndProps): React.ReactElement {
  const { getImageUrl } = useTmdbConfig();
  const tierMetadata = TIER_METADATA_MAP[tier.id];
  const tierColorClass = tierMetadata?.colorClass || "bg-gray-700";

  return (
    <div className="flex min-w-0">
      <div className={`w-16 sm:w-32 py-4 sm:py-8 text-center text-sm sm:text-base flex-shrink-0 ${tierColorClass}`}>
        {tier.title}
      </div>
      <Droppable droppableId={tier.id} direction="horizontal">
        {(provided) => (
          <div
            className="pl-2 sm:pl-4 flex flex-nowrap items-center gap-2 sm:gap-4 border flex-1 min-w-0 select-none overflow-x-auto"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {tier.items.map((item, index) => (
              <DataCard
                key={item.id}
                item={item}
                index={index}
                onMovieSelect={onMovieSelect}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
