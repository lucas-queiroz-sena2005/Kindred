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

  const isSent = (msg: Message) => typeof currentUser?.id === "number" && msg.sender_id === currentUser.id;

  return (
    <>
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2 flex-shrink-0">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">{user?.username ?? "…"}</h2>
        {user?.id != null && <ConnectionStatusButton targetId={user.id} />}
      </div>

      <div className="flex-grow p-4 overflow-y-auto min-h-0 flex flex-col">
        {isLoading || isAuthLoading ? (
          <div className="flex justify-center items-center flex-1">
            <p className="text-neutral-500 dark:text-neutral-400">Loading messages...</p>
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center flex-1">
            <p className="text-red-500">{error?.message}</p>
          </div>
        ) : !currentUser ? (
          <div className="flex justify-center items-center flex-1">
            <p className="text-neutral-500 dark:text-neutral-400">Loading...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const sent = isSent(msg);
              return (
                <div
                  key={msg.id}
                  className={`flex ${sent ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`rounded-2xl px-4 py-2.5 max-w-[85%] sm:max-w-md ${
                      sent
                        ? "bg-purple-600 text-white"
                        : "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    {msg.created_at && (
                      <p className={`text-[10px] mt-1 ${sent ? "text-purple-200" : "text-neutral-500 dark:text-neutral-400"}`}>
                        {new Date(msg.created_at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex gap-2 flex-shrink-0"
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 min-w-0 px-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg border border-neutral-200 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
          disabled={mutation.isPending}
        />
        <button
          type="submit"
          className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 font-medium flex-shrink-0"
          disabled={mutation.isPending || !message.trim()}
        >
          Send
        </button>
      </form>
    </>
  );
}

export default Conversation;
