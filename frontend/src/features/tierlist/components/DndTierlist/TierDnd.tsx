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
    <div className="flex">
      <div className={`w-32 py-8 text-center ${tierColorClass}`}>
        {tier.title}
      </div>
      <Droppable droppableId={tier.id} direction="horizontal">
        {(provided) => (
          <div
            className="pl-4 flex flex-nowrap items-center gap-4 border w-full select-none overflow-x-auto"
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
