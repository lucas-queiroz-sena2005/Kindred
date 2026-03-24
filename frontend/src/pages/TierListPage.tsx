import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { TierList } from "@/features/tierlist/components/TierList";
import { api } from "@/api";
import type { TierListData } from "@/types/tierlist";
import { MovieDetailSidebar } from "@/features/tierlist/components/MovieDetailSidebar";
import { TierListPageProvider } from "@/features/tierlist/context/TierListPageProvider";
import ErrorMessage from "@/shared/ui/ErrorMessage";

function TierListPage(): React.ReactElement {
  const { id } = useParams();
  const tierlistId = id ? parseInt(id, 10) : undefined;

  const { data, isLoading, isError, error } = useQuery<TierListData, Error>({
    queryKey: ["tierlist", tierlistId],
    queryFn: () => api.tierlists.getById(tierlistId!),
    enabled: !!tierlistId && !isNaN(tierlistId),
  });

  if (!tierlistId || isNaN(tierlistId)) {
    return (
      <ErrorMessage message="Invalid or no tierlist ID provided." />
    );
  }

  if (isError) {
    return (
      <ErrorMessage message={error.message} />
    );
  }

  return (
    <TierListPageProvider>
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">{data?.title || "Tier List"}</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-1">
          Rank movies by dragging or tapping. On mobile, tap mode is used by default.
        </p>
        {data?.description && (
          <p className="text-neutral-600 dark:text-neutral-400">{data.description}</p>
        )}
      </header>
      <div className="flex flex-col lg:flex-row gap-6 min-w-0">
        <div className="flex-grow min-w-0">
          <TierList 
            templateData={data} 
            isLoading={isLoading} 
          />
        </div>
        <MovieDetailSidebar />
      </div>
    </TierListPageProvider>
  );
}

export default TierListPage;