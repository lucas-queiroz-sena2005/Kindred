import React, { useState, useEffect } from "react";
import TierlistDnd from "./DndTierlist/TierlistDnd";
import TierlistTap from "./TapTierlist/TierlistTap";
import { useNavigate } from "react-router-dom";
import type { TierState, TierListData } from "../../../types/tierlist";
import { useMediaQuery } from "../../../hooks/useMediaQuery";
import { transformToTierState, transformToTierData } from "../util/tierlist-transformer";
import { api } from "../../../api";

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
  const navigate = useNavigate();
  const [mode, setMode] = useState<InteractionMode>("auto");
  const [tierState, setTierState] = useState<TierState | undefined>();
<<<<<<< HEAD
  const [initialTierState, setInitialTierState] = useState<TierState | undefined>();
  const [savingStatus, setSavingStatus] = useState<"Save" | "Saving" | "Failed">("Save");

  useEffect(() => {
    if (templateData) {
      const transformedData = transformToTierState(templateData);
      setInitialTierState(transformedData);
=======
  const [savingStatus, setSavingStatus] = useState<"Save" | "Saving" | "Failed">("Save")
  useEffect(() => {
    if (templateData) {
      const transformedData = transformToTierState(templateData);
>>>>>>> main
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
<<<<<<< HEAD

=======
  
>>>>>>> main
  async function handleSave() {
    if (!tierState || !templateData) {
      setSavingStatus("Failed");
      return;
    }
    setSavingStatus("Saving");
    const transformedData = transformToTierData(tierState, templateData?.id);
    api.tierlists.postTierlist(transformedData)
      .then(() => {
        setSavingStatus("Save");
<<<<<<< HEAD
        navigate("/tierlists");
      })
      .catch(() => {
        setSavingStatus("Failed");
      });
  }

  function handleCancel() {
    if (initialTierState) {
      setTierState(initialTierState);
    }
=======
        navigate("/tierlists")
      })
      .catch(() => {
        setSavingStatus("Failed");
      })
>>>>>>> main
  }

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

<<<<<<< HEAD
      <div className="flex justify-end space-x-4 mt-6">
        <button
          onClick={handleCancel}
          className="px-6 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={savingStatus === "Saving"}
          className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:bg-purple-400"
=======
      <div>
        <button>Cancel</button>
        <button
          onClick={handleSave}
          disabled={savingStatus === "Saving"}
>>>>>>> main
        >
          {savingStatus}
        </button>
      </div>
    </>
  );
}
