import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../api";
import { KinUserCard } from "../components/KinUserCard";
import ErrorMessage from '../components/ErrorMessage';
import { useOnScrollToBottom } from "../hooks/useOnScrollToBottom";
import { KinUserCardSkeleton } from "../components/KinUserCardSkeleton";

function KinPage(): React.ReactElement {
  const PAGE_LIMIT = 20;
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    isSuccess,
  } = useInfiniteQuery({
    queryKey: ["kin"],
    queryFn: ({ pageParam }) =>
      api.kin.getKin({
        filter: "all",
        sortBy: "overall",
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

  const kinList = data?.pages.flat() ?? [];

  const showEmptyState = isSuccess && kinList.length === 0;
  const showNoMoreResults =
    isSuccess && !hasNextPage && !isFetchingNextPage && kinList.length > 0;

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">My Kin</h1>
        <p className="text-neutral-600 mt-2">
          Pessoas que compartilham o mesmo "DNA cinematográfico" que você.
        </p>
      </header>

      {isError && (
        <div className="text-center py-12">
          <ErrorMessage message="Failed to load compatible users. Please try again later." />
        </div>
      )}

      {showEmptyState && (
        <div className="text-center py-12 bg-white rounded-lg border border-neutral-200">
          <h2 className="text-xl font-semibold mb-2">No Kin found yet</h2>
          <p className="text-neutral-600">
            Try ranking more movies to improve your taste profile!
          </p>
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {kinList.map((kinUser) => (
          <KinUserCard key={kinUser.userId} user={kinUser} />
        ))}
        {(isLoading || isFetchingNextPage) &&
          [...Array(isLoading ? 6 : 3)].map((_, i) => <KinUserCardSkeleton key={i} />)}
      </section>

      {showNoMoreResults && (
        <div className="text-center py-8 text-neutral-500">
          No more kin to show.
        </div>
      )}
    </>
  );
}

export default KinPage;
