import React, { useCallback } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import type { TierState } from "../../../../types/tierlist";
import { arrayMove, arrayTransfer } from "../../util/helpersDnd";
import TierDnd from "./TierDnd";
import { TIER_ORDER } from "../../constants/tier-constants";

interface TierlistDndProps {
  tierState: TierState;
  setTierState: React.Dispatch<React.SetStateAction<TierState | undefined>>;
}

export default function TierlistDnd({
  tierState,
  setTierState,
}: TierlistDndProps): React.ReactElement {
  const onDragEnd = useCallback(
    ({ source, destination }: DropResult) => {
      // Item was dropped outside of any droppable area or in the same place it started.
      if (
        !destination ||
        (source.droppableId === destination.droppableId &&
          source.index === destination.index)
      ) {
        return;
      }

      setTierState((currentTierState) => {
        // If state is not yet defined, do nothing.
        if (!currentTierState) return currentTierState;

        // Deep copy to avoid direct state mutation.
        const newState = JSON.parse(JSON.stringify(currentTierState));

        if (source.droppableId === destination.droppableId) {
          // Reordering within the same tier.
          const tierItems = newState[source.droppableId].items;
          newState[source.droppableId].items = arrayMove(
            tierItems,
            source.index,
            destination.index
          );
        } else {
          // Moving between different tiers.
          const sourceItems = newState[source.droppableId].items;
          const destItems = newState[destination.droppableId].items;
          const [newSourceItems, newDestItems] = arrayTransfer(
            sourceItems,
            destItems,
            source.index,
            destination.index
          );
          newState[source.droppableId].items = newSourceItems;
          newState[destination.droppableId].items = newDestItems;
        }
        console.log(newState)
        return newState;
      });
    },
    [setTierState]
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div>
        {TIER_ORDER.map((tierId) => {
          const tier = tierState[tierId];
          // Render only if the tier data exists, preventing potential crashes.
          return tier ? <TierDnd key={tierId} tier={tier} /> : null;
        })}
      </div>
    </DragDropContext>
  );
}
