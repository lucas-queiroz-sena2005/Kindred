import { Droppable } from "@hello-pangea/dnd";
import DataCard from "./Datacard";
import type { Tier } from "../../../../types/tierlist";
import { TIERS, UNRANKED_TIER } from "../../constants/tier-constants";
import { useTmdbConfig } from "../../../../context/TmdbConfigProvider";

const TIER_METADATA_MAP = Object.fromEntries(
  [...TIERS, UNRANKED_TIER].map((t) => [t.id, t])
);

export default function TierDnd({ tier }: { tier: Tier }): React.ReactElement {
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
            className="pl-4 flex flex-wrap items-center gap-4 border w-full select-none"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {tier.items.map((item, index) => (
              <DataCard
                key={item.id}
                id={String(item.id)}
                index={index}
                imageUrl={getImageUrl(item.poster_path || "")}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
