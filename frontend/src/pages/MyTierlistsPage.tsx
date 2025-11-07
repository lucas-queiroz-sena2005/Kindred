import React from "react";
import { api } from "../api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useOnScrollToBottom } from "../hooks/useOnScrollToBottom";
import { TemplateCard } from "../components/TemplateCard";
import { TemplateCardSkeleton } from "../components/TemplateCardSkeleton";

function MyTierlistPage(): React.ReactElement {
  const PAGE_LIMIT = 10;
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    isSuccess,
    error,
  } = useInfiniteQuery({
    queryKey: ["feedTemplates"],
    queryFn: ({ pageParam }) =>
      api.tierlists.getList({
        sortBy: "createdAt",
        filter: "ranked",
        limit: PAGE_LIMIT,
        offset: pageParam,
      }),      
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.flat().length;
      return lastPage.length < PAGE_LIMIT ? undefined : totalFetched;
    },
  });

  useOnScrollToBottom(fetchNextPage, hasNextPage, isFetchingNextPage);

  const templates = data?.pages.flat() ?? [];

  const showEmptyState = isSuccess && templates.length === 0;
  const showNoMoreResults =
    isSuccess && !hasNextPage && !isFetchingNextPage && templates.length > 0;

  return (
    <>
      <h1 className="text-3xl font-bold mb-4">My Tierlists</h1>

      {isError && <p className="text-red-500">Error: {error.message}</p>}

      {showEmptyState && (
        <div>You haven't ranked any tierlists yet.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isSuccess &&
          templates.map((template) => (
            <TemplateCard key={template.id} {...template} />
          ))}

        {(isLoading || isFetchingNextPage) &&
          [...Array(isLoading ? 6 : 3)].map((_, i) => <TemplateCardSkeleton key={i} />)}
      </div>

      {showNoMoreResults && <div>No more tierlists to show.</div>}
    </>
  );
}

export default MyTierlistPage;