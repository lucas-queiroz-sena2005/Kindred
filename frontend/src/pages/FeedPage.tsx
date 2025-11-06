import React from "react";
import { api } from "../api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useOnScrollToBottom } from "../hooks/useOnScrollToBottom";
import { TemplateCard } from "../components/TemplateCard";

function FeedPage(): React.ReactElement {
  const PAGE_LIMIT = 10;
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["feedTemplates"],
    queryFn: ({ pageParam }) =>
      api.tierlists.getList({
        sortBy: "createdAt",
        filter: "all",
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

  const showNoMoreTemplates =
    !isLoading && !isFetchingNextPage && !hasNextPage && templates.length > 0;

  return (
    <>
      <h1 className="text-3xl font-bold mb-4">Feed</h1>

      {isLoading && <p>Loading tierlists...</p>}
      {isError && <p className="text-red-500">Error: {error.message}</p>}

      {templates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <TemplateCard key={template.id} {...template} />
          ))}
        </div>
      )}

      {isFetchingNextPage && <div>Loading more...</div>}
      {showNoMoreTemplates && <div>No more templates to show.</div>}
    </>
  );
}

export default FeedPage;