import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { TierList } from "../features/tierlist/components/TierList";
import { api } from "../api";
import type { TierListData } from "../types/tierlist";
import { MovieDetailSidebar } from "../features/tierlist/components/MovieDetailSidebar";
import { TierListPageProvider } from "../features/tierlist/context/TierListPageProvider";
import ErrorMessage from "../components/ErrorMessage";

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
      <h1 className="text-3xl font-bold mb-4">{data?.title || "Tier List"}</h1>
      <p className="mb-6 text-gray-600">{data?.description}</p>
      <div className="flex flex-row gap-6">
        <div className="flex-grow">
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