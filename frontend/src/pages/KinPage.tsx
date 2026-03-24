import React, { useState } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { KinUserCard } from "@/features/kin/KinUserCard";
import ErrorMessage from "@/shared/ui/ErrorMessage";
import { useOnScrollToBottom } from "@/hooks/useOnScrollToBottom";
import { KinUserCardSkeleton } from "@/features/kin/KinUserCardSkeleton";
import type { KinUser, CompareDetails } from "@/types/kin";
import { useClickOutside } from "@/hooks/useClickOutside";

type ConnectionFilter = "all" | "connected" | "unconnected";
type CategoryFilter = string;

function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function KinPage(): React.ReactElement {
  const [openId, setOpenId] = useState<number | null>(null);
  const [messageOpenId, setMessageOpenId] = useState<number | null>(null);
  const [connectionFilter, setConnectionFilter] =
    useState<ConnectionFilter>("all");
  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilter>("overall");

  const { data: categoryFilters = [] } = useQuery({
    queryKey: ["kinCategories"],
    queryFn: api.kin.getCategories,
    staleTime: Infinity,
  });

  const {
    data: details,
    isLoading: isComparasionLoading,
    isError: isComparisonError,
  } = useQuery<CompareDetails, Error>({
    queryKey: ["compareKin", openId],
    queryFn: () => api.kin.compareKin(openId!),
    enabled: !!openId && !isNaN(openId),
    refetchOnWindowFocus: false,
  });

  const closeAll = () => {
    setOpenId(null);
    setMessageOpenId(null);
  };

  const containerRef = useClickOutside<HTMLDivElement>(closeAll);

  function handleToggle(id: number) {
    setOpenId((prev) => {
      const newOpenId = prev === id ? null : id;
      if (newOpenId === null) {
        setMessageOpenId(null);
      }
      return newOpenId;
    });
  }

  function handleMessageToggle(id: number) {
    setMessageOpenId((prev) => {
      if (prev === id) {
        return null;
      }
      setOpenId(id);
      return id;
    });
  }

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
    queryKey: ["kin", connectionFilter, categoryFilter],
    queryFn: ({ pageParam = 0 }) =>
      api.kin.getKin({
        filter: connectionFilter,
        sortBy: categoryFilter,
        limit: PAGE_LIMIT,
        offset: pageParam,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length === 0) {
        return undefined;
      }
      const totalFetched = allPages.flat().length;
      return lastPage.length < PAGE_LIMIT ? undefined : totalFetched;
    },
  });

  useOnScrollToBottom(fetchNextPage, hasNextPage, isFetchingNextPage);

  const kinList = data?.pages.flat() ?? [];

  const showEmptyState = isSuccess && kinList.length === 0;
  const showNoMoreResults =
    isSuccess && !hasNextPage && !isFetchingNextPage && kinList.length > 0;

  const connectionFilters: { label: string; value: ConnectionFilter }[] = [
    { label: "All", value: "all" },
    { label: "Connected", value: "connected" },
    { label: "Unconnected", value: "unconnected" },
  ];

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">My Kin</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          People who share the same cinematic &quot;DNA&quot; as you—discover your movie soulmates.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
          {/* Connection Status Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Show:</span>
            <div className="flex rounded-md shadow-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              {connectionFilters.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setConnectionFilter(value)}
                  className={`px-3 py-1 text-sm font-medium transition-colors duration-150 rounded-md
                    ${
                      connectionFilter === value
                        ? "bg-neutral-800 dark:bg-neutral-600 text-white"
                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    }
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <label
              htmlFor="category-filter"
              className="text-sm font-medium text-neutral-600 dark:text-neutral-400"
            >
              Based on:
            </label>
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value as CategoryFilter)
              }
              className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 rounded-md shadow-sm focus:outline-none focus:ring-neutral-500 focus:border-neutral-500"
            >
              {categoryFilters.map((category) => (
                <option key={category} value={category}>
                  {capitalize(category)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {isError && (
        <div className="text-center py-12">
          <ErrorMessage message="Failed to load compatible users. Please try again later." />
        </div>
      )}

      {isLoading && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {[...Array(6)].map((_, i) => (
            <KinUserCardSkeleton key={i} />
          ))}
        </section>
      )}

      {showEmptyState && !isLoading && (
        <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold mb-2 text-neutral-900 dark:text-neutral-100">No Kin found yet</h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            No users match the current filters. Try a different combination!
          </p>
        </div>
      )}

      <div ref={containerRef}>
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {!isLoading &&
            kinList.map((kinUser: KinUser) => (
              <KinUserCard
                key={kinUser.id}
                user={kinUser}
                isOpen={openId === kinUser.id}
                onToggle={() => handleToggle(kinUser.id)}
                isMessageOpen={messageOpenId === kinUser.id}
                onMessageToggle={() => handleMessageToggle(kinUser.id)}
                details={details}
                isLoading={isComparasionLoading}
                isError={isComparisonError}
              />
            ))}
          {isFetchingNextPage &&
            [...Array(3)].map((_, i) => <KinUserCardSkeleton key={i} />)}
        </section>
      </div>

      {showNoMoreResults && (
        <ErrorMessage message="No more kin to show." variant="info" className="mt-4 mb-0" />
      )}
    </>
  );
}

export default KinPage;
