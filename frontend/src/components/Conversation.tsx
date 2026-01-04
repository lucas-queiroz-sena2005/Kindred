import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { ConversationUser, Message } from "../types/messages";
import { useAuth } from "../hooks/useAuth";
import ConnectionStatusButton from "./ConnectionStatusButton";
import { useParams, useOutletContext, useLocation } from "react-router-dom";

interface OutletContextType {
  conversations: ConversationUser[] | undefined;
}

function Conversation(): React.ReactElement {
  const { targetId } = useParams<{ targetId: string }>();
  const { conversations } = useOutletContext<OutletContextType>();
  const { user: currentUser, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const targetUser = location.state?.targetUser;

  const user =
    conversations?.find((c) => c.id === Number(targetId)) || targetUser;

  const {
    data: messages = [],
    isLoading,
    isError,
    error,
  } = useQuery<Message[], Error>({
    queryKey: ["messages", targetId],
    queryFn: () => api.messages.getMessages(Number(targetId)),
    refetchInterval: 3000,
    enabled: !!targetId,
  });

  const mutation = useMutation({
    mutationFn: () => api.messages.sendMessage(Number(targetId), message),
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["messages", targetId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      mutation.mutate();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!targetId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-neutral-500">
          Select a conversation to start messaging.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center">
        <h2 className="text-xl font-semibold">{user.username}</h2>
        <ConnectionStatusButton targetId={user.id} />
      </div>

      <div className="flex-grow p-4 overflow-y-auto">
        {isLoading || isAuthLoading ? (
          <div className="flex justify-center items-center h-full">
            <p>Loading messages...</p>
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-red-500">{error?.message}</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender_id === currentUser?.id
                  ? "justify-end"
                  : "justify-start"
              } mb-4`}
            >
              <div
                className={`${
                  msg.sender_id == currentUser?.id
                    ? "bg-purple-600 text-white"
                    : "bg-neutral-200 dark:bg-neutral-700"
                } rounded-lg py-2 px-4 max-w-xs`}
              >
                <p>{msg.content}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex"
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={mutation.isPending}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700 disabled:bg-purple-400"
          disabled={mutation.isPending || !message.trim()}
        >
          Send
        </button>
      </form>
    </>
  );
}

export default Conversation;
