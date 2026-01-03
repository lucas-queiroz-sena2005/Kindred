import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import type { ConversationUser } from "../types/messages";
import Conversation from "../components/Conversation";
import { ConversationListItemSkeleton } from "../components/ConversationListItemSkeleton";

function MessagesPage(): React.ReactElement {
  const [selectedUser, setSelectedUser] = useState<ConversationUser | null>(
    null,
  );

  const {
    data: conversations,
    isLoading,
    isError,
    error,
  } = useQuery<ConversationUser[], Error>({
    queryKey: ["conversations"],
    queryFn: api.messages.getConversations,
  });

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
            <div
              key={user.id}
              className={`p-4 cursor-pointer ${
                selectedUser?.id === user.id
                  ? "bg-purple-100 dark:bg-purple-900"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
              onClick={() => setSelectedUser(user)}
            >
              <p className="font-semibold">{user.username}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="w-2/3 flex flex-col">
        {selectedUser ? (
          <Conversation user={selectedUser} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-neutral-500">
              Select a conversation to start messaging.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MessagesPage;
