import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../api";
import { KinUserCard } from "../components/KinUserCard";
import ErrorMessage from "../components/ErrorMessage";
import { useOnScrollToBottom } from "../hooks/useOnScrollToBottom";
import { KinUserCardSkeleton } from "../components/KinUserCardSkeleton";
import type { KinUser, CompareDetails } from "../types/kin";
import { useClickOutside } from "../hooks/useClickOutside";

function KinPage(): React.ReactElement {
  const [openId, setOpenId] = useState<number | null>(null);
  const [messageOpenId, setMessageOpenId] = useState<number | null>(null);

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
      // Close message box when closing card
      if (newOpenId === null) {
        setMessageOpenId(null);
      }
      return newOpenId;
    });
  }

  function handleMessageToggle(id: number) {
    // Always ensure the main card is open when dealing with messages
    setOpenId(id);
    // Toggle the message part
    setMessageOpenId((prev) => (prev === id ? null : id));
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

      <div ref={containerRef}>
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {kinList.map((kinUser: KinUser) => (
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
          {(isLoading || isFetchingNextPage) &&
            [...Array(isLoading ? 6 : 3)].map((_, i) => (
              <KinUserCardSkeleton key={i} />
            ))}
        </section>
      </div>

      {showNoMoreResults && (
        <div className="text-center py-8 text-neutral-500">
          No more kin to show.
        </div>
      )}
    </>
  );
}

export default KinPage;
