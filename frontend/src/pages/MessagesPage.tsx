import React, { useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import type { ConversationUser } from "@/types/messages";
import { ConversationListItemSkeleton } from "@/features/messages/ConversationListItemSkeleton";
import { Link, Outlet, useParams, useNavigate } from "react-router-dom";

function MessagesPage(): React.ReactElement {
  const { targetId } = useParams<{ targetId: string }>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(!targetId);

  const {
    data: conversations,
    isLoading,
    isError,
    error,
  } = useQuery<ConversationUser[], Error>({
    queryKey: ["conversations"],
    queryFn: api.messages.getConversations,
  });

  const openConversationList = useCallback(() => setSidebarOpen(true), []);
  const closeConversationList = useCallback(() => setSidebarOpen(false), []);

  useEffect(() => {
    if (!targetId && conversations && conversations.length > 0) {
      navigate(`/messages/${conversations[0].id}`);
    }
  }, [conversations, targetId, navigate]);

  useEffect(() => {
    if (targetId) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [targetId]);

  const handlePickConversation = () => {
    closeConversationList();
  };

  return (
    <div className="flex flex-col w-full max-w-full">
      <div className="relative flex h-[calc(100vh-11rem)] min-h-[20rem] sm:h-[calc(100vh-200px)] rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-neutral-50 dark:bg-neutral-950/50">
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close conversation list"
            className="absolute inset-0 z-30 bg-black/45 sm:hidden"
            onClick={closeConversationList}
          />
        )}

        <aside
          className={[
            "absolute left-0 top-0 bottom-0 z-40 flex w-[min(20rem,90vw)] flex-col border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900",
            "transition-transform duration-200 ease-out sm:static sm:z-0 sm:w-1/3 sm:translate-x-0 sm:shadow-none",
            sidebarOpen ? "translate-x-0 shadow-xl" : "-translate-x-full",
          ].join(" ")}
        >
          <div className="flex-shrink-0 border-b border-neutral-200 p-4 dark:border-neutral-800">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Conversations
            </h2>
            <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
              Select a chat or start one from Kin.
            </p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {isLoading && (
              <>
                <ConversationListItemSkeleton />
                <ConversationListItemSkeleton />
                <ConversationListItemSkeleton />
              </>
            )}
            {isError && (
              <div className="p-4">
                <p className="text-red-500">{error?.message}</p>
              </div>
            )}
            {conversations?.map((user) => (
              <Link
                to={`/messages/${user.id}`}
                key={user.id}
                onClick={handlePickConversation}
              >
                <div
                  className={`cursor-pointer p-4 text-neutral-900 dark:text-neutral-100 ${
                    targetId && parseInt(targetId, 10) === user.id
                      ? "bg-purple-100 dark:bg-purple-900/50"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  <p className="font-semibold">{user.username}</p>
                </div>
              </Link>
            ))}
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col sm:flex-1">
          <Outlet
            context={{
              conversations,
              openConversationList,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default MessagesPage;
