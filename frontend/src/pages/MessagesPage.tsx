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
    <div className="flex h-[calc(100vh-200px)]">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-neutral-200 dark:border-neutral-800">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-semibold">Conversations</h2>
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
                className={`p-4 cursor-pointer ${
                  targetId && parseInt(targetId, 10) === user.id
                    ? "bg-purple-100 dark:bg-purple-900"
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
      <div className="w-2/3 flex flex-col">
        <Outlet context={{ conversations }} />
      </div>
    </div>
  );
}

export default MessagesPage;
