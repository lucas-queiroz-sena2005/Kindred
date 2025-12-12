import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { TierList } from "../features/tierlist/components/TierList";
import { api } from "../api";
import type { TierListData } from "../types/tierlist";

function TierListPage(): React.ReactElement {
  const { id } = useParams();
  const tierlistId = id ? parseInt(id, 10) : undefined;

  const { data, isLoading, isError, error } = useQuery<TierListData, Error>({
    queryKey: ["tierlist", tierlistId],
    queryFn: () => api.tierlists.getById(tierlistId!),
    enabled: !!tierlistId && !isNaN(tierlistId),
  });

  useEffect(() => {
    if (data) {
      console.log("Tierlist data fetched:", data);
    }
  }, [data]);

  if (!tierlistId || isNaN(tierlistId)) {
    return (
      <p className="text-center py-8 text-red-500">
        Invalid or no tierlist ID provided.
      </p>
    );
  }

  if (isError) {
    return (
      <p className="text-center py-8 text-red-500">Error: {error.message}</p>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-4">{data?.title || "Tier List"}</h1>
      <p className="mb-6 text-gray-600">{data?.description}</p>

      <TierList templateData={data} isLoading={isLoading} />
    </>
  );
}

export default TierListPage;