import React, { useState, useEffect } from "react";
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
}: TierlistDndProps) {
  function onDragEnd({ source, destination }: DropResult) {
    // Item was dropped outside of any droppable area
    if (!destination) return;

    // Item was dropped in the same place it started
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    setTierState((currentTierState) => {
      if (!currentTierState) return currentTierState;

      const newState = JSON.parse(JSON.stringify(currentTierState)); // Deep copy

      if (source.droppableId === destination.droppableId) {
        // Reordering within the same tier
        const tierItems = newState[source.droppableId].items;
        newState[source.droppableId].items = arrayMove(
          tierItems,
          source.index,
          destination.index
        );
      } else {
        // Moving between tiers
        const sourceItems = newState[source.droppableId].items;
        const destItems = newState[destination.droppableId].items;
        [
          newState[source.droppableId].items,
          newState[destination.droppableId].items,
        ] = arrayTransfer(
          sourceItems,
          destItems,
          source.index,
          destination.index
        );
      }
      return newState;
    });
  }

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
