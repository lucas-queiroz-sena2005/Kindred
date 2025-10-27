import React, { useState } from "react";
import { TierListDnD } from "../../../components/TierListDnD";
import { TierListTap } from "../../../components/TierListTap";
import type { TierListData } from "../../../types/tierlist";
import { useMediaQuery } from "../../../hooks/useMediaQuery";

type InteractionMode = "auto" | "drag" | "tap";
const MODES: InteractionMode[] = ["auto", "drag", "tap"];

interface TierListProps {
  templateData: TierListData | undefined;
  isLoading: boolean;
}

export function TierList({ templateData, isLoading }: TierListProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [mode, setMode] = useState<InteractionMode>("auto");

  if (isLoading) return <div className="text-center py-8">Loading tier list...</div>;
  if (!templateData) return <div className="text-center py-8 text-red-500">Tier list template not found.</div>;

  return (
    <>
      <div className="mode-switcher mb-4">
        {MODES.map((m) => (
          <button key={m} onClick={() => setMode(m)}>
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {mode === "drag" || (mode === "auto" && isDesktop) ? (
        <TierListDnD templateData={templateData} />
      ) : (
        <TierListTap templateData={templateData} />
      )}
    </>
  );
}
