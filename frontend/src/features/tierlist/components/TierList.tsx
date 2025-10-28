import React, { useState, useEffect } from "react";
import TierlistDnd from "./DndTierlist/TierlistDnd";
import TierlistTap from "./TapTierlist/TierlistTap";
import type { TierState, TierListData } from "../../../types/tierlist";
import { useMediaQuery } from "../../../hooks/useMediaQuery";
import { transformToTierState } from "../util/tierlist-transformer";

type InteractionMode = "auto" | "drag" | "tap";
const MODES: InteractionMode[] = ["auto", "drag", "tap"];

interface TierListProps {
  templateData: TierListData | undefined;
  isLoading: boolean;
}

export function TierList({
  templateData,
  isLoading,
}: TierListProps): React.ReactElement {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [mode, setMode] = useState<InteractionMode>("auto");
  const [tierState, setTierState] = useState<TierState | undefined>();

  useEffect(() => {
    if (templateData) {
      const transformedData = transformToTierState(templateData);
      setTierState(transformedData);
    }
  }, [templateData]);

  if (isLoading)
    return <div className="text-center py-8">Loading tier list...</div>;
  if (!tierState)
    return (
      <div className="text-center py-8 text-red-500">
        Tier list template not found.
      </div>
    );

  // Determine the effective interaction mode based on user selection and screen size.
  const effectiveMode = mode === "auto" ? (isDesktop ? "drag" : "tap") : mode;

  return (
    <>
      <div className="mode-switcher mb-4">
        {MODES.map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded ${
              mode === m ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {effectiveMode === "drag" && (
        <TierlistDnd tierState={tierState} setTierState={setTierState} />
      )}
      {effectiveMode === "tap" && (
        <TierlistTap
          tierState={tierState}
          setTierState={(updater) => {
            // We wrap the original setTierState to ensure the updater function
            // inside TierlistTap never receives an undefined state.
            // The check for `!s` handles the type mismatch.
            setTierState((s) => (s ? updater(s) : s));
          }}
        />
      )}

      <div>
        <button>Cancel</button>
        <button>Save</button>
      </div>
    </>
  );
}
