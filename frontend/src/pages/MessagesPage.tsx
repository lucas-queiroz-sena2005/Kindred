import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import type { ConversationUser } from "../types/messages";
import { ConversationListItemSkeleton } from "../components/ConversationListItemSkeleton";
import { Link, Outlet, useParams, useNavigate } from "react-router-dom";

function MessagesPage(): React.ReactElement {
  const { targetId } = useParams<{ targetId: string }>();
  const navigate = useNavigate();

  const {
    data: conversations,
    isLoading,
    isError,
    error,
  } = useQuery<ConversationUser[], Error>({
    queryKey: ["conversations"],
    queryFn: api.messages.getConversations,
  });

  useEffect(() => {
    if (!targetId && conversations && conversations.length > 0) {
      navigate(`/messages/${conversations[0].id}`);
    }
  }, [conversations, targetId, navigate]);

  return (
    <div className="flex flex-col sm:flex-row h-[calc(100vh-200px)] min-h-0">
      {/* Sidebar */}
      <div className="w-full sm:w-1/3 border-r border-neutral-200 dark:border-neutral-800 flex flex-col min-w-0">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Conversations</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Select a conversation or start a new one from Kin.</p>
        </div>
        {/* Conversation List */}
        <div className="overflow-y-auto">
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
            <Link to={`/messages/${user.id}`} key={user.id}>
              <div
                className={`p-4 cursor-pointer text-neutral-900 dark:text-neutral-100 ${
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
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <Outlet context={{ conversations }} />
      </div>
    </div>
  );
}
export default MessagesPage;

