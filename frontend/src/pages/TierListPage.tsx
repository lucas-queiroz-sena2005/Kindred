import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { TierList } from "../features/tierlist/components/TierList";
import { api } from "../api";
import type { TierListData, Movie } from "../types/tierlist";
import { MovieDetailSidebar } from "../features/tierlist/components/MovieDetailSidebar";

function TierListPage(): React.ReactElement {
  const { id } = useParams();
  const tierlistId = id ? parseInt(id, 10) : undefined;
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

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
      <div className="flex flex-row gap-6">
        <div className="flex-grow">
          <TierList 
            templateData={data} 
            isLoading={isLoading} 
            onMovieSelect={setSelectedMovie}
          />
        </div>
        <MovieDetailSidebar movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      </div>
    </>
  );
}

export default TierListPage;