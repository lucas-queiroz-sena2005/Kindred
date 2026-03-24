import React, { useState, useEffect } from "react";
import TierlistDnd from "./DndTierlist/TierlistDnd";
import TierlistTap from "./TapTierlist/TierlistTap";
import { useNavigate } from "react-router-dom";
import type { TierState, TierListData } from "@/types/tierlist";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { transformToTierState, transformToTierData } from "../util/tierlist-transformer";
import { api } from "@/api";
import { useTierListPage } from "../context/TierListPageProvider";
import { cn } from "@/shared/lib/cn";

type InteractionMode = "auto" | "drag" | "tap";

const MODE_OPTIONS: { value: InteractionMode; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "drag", label: "Drag & drop" },
  { value: "tap", label: "Tap" },
];

interface TierListProps {
  templateData: TierListData | undefined;
  isLoading: boolean;
}

export function TierList({
  templateData,
  isLoading,
}: TierListProps): React.ReactElement {
  const { setSelectedMovie } = useTierListPage();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const navigate = useNavigate();
  const [mode, setMode] = useState<InteractionMode>("auto");
  const [tierState, setTierState] = useState<TierState | undefined>();
  const [initialTierState, setInitialTierState] = useState<TierState | undefined>();
  const [savingStatus, setSavingStatus] = useState<"Save" | "Saving" | "Failed">("Save");

  useEffect(() => {
    if (templateData) {
      const transformedData = transformToTierState(templateData);
      setInitialTierState(transformedData);
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
        navigate("/tierlists");
      })
      .catch(() => {
        setSavingStatus("Failed");
      });
  }

  function handleCancel() {
    navigate(-1);
  }

  // Determine the effective interaction mode based on user selection and screen size.
  const effectiveMode = mode === "auto" ? (isDesktop ? "drag" : "tap") : mode;

  return (
    <>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            Mode:
          </span>
          <div className="flex rounded-md border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
            {MODE_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                className={cn(
                  "px-3 py-1 text-sm font-medium transition-colors duration-150 first:rounded-l-md last:rounded-r-md",
                  "focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900",
                  mode === value
                    ? "bg-neutral-800 text-white dark:bg-neutral-600"
                    : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {effectiveMode === "drag" && (
        <TierlistDnd tierState={tierState} setTierState={setTierState} onMovieSelect={setSelectedMovie} />
      )}
      {effectiveMode === "tap" && (
        <TierlistTap
          tierState={tierState}
          onMovieSelect={setSelectedMovie}
          setTierState={(updater) => {
            // We wrap the original setTierState to ensure the updater function
            // inside TierlistTap never receives an undefined state.
            // The check for `!s` handles the type mismatch.
            setTierState((s) => (s ? updater(s) : s));
          }}
        />
      )}

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
        >
          {savingStatus}
        </button>
      </div>
    </>
  );
}

