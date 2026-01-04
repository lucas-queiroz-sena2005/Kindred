import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Message } from "../types/messages";
import type { CompareDetails, KinUser } from "../types/kin";

interface KinUserCardProps {
  user: KinUser;
  isOpen: boolean;
  onToggle: () => void;
  details?: CompareDetails | null;
  isLoading: boolean;
  isError: boolean;
}

export function KinUserCard({
  user,
  isOpen,
  onToggle,
  details,
  isLoading,
  isError,
}: KinUserCardProps): React.ReactElement {
  const [clicked, setClicked] = useState(false);
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const targetId = user.id;

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    setClicked((prev) => !prev);
  }

  const {
    data: messages = [],
    isLoading: isMessagesLoading,
    isError: isMessagesError,
    error: messagesError,
  } = useQuery<Message[], Error>({
    queryKey: ["messages", targetId],
    queryFn: () => api.messages.getMessages(Number(targetId)),
    refetchInterval: 3000,
    enabled: !!targetId && clicked,
  });

  const mutation = useMutation({
    mutationFn: (newMessage: string) =>
      api.messages.sendMessage(Number(targetId), newMessage),
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["messages", targetId] });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (message.trim()) {
      mutation.mutate(message);
    }
  };

  const percentage = (user.similarityScore * 100).toFixed(1);

  const overallScore = ((details?.overallScore ?? 0) * 100).toFixed(1);

  const dynamicSegments = details?.segments
    ? Object.entries(details.segments).reduce(
        (acc, [key, val]) => {
          const label =
            key.replace("Score", "").charAt(0).toUpperCase() +
            key.replace("Score", "").slice(1);
          acc[label] = ((val ?? 0) * 100).toFixed(1);
          return acc;
        },
        {} as Record<string, string>,
      )
    : {};

  const fixedDetails = {
    Overall: overallScore,
    ...dynamicSegments,
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200 hover:shadow-md transition-shadow h-fit">
      <article
        onClick={onToggle}
        className="flex justify-between items-center cursor-pointer"
      >
        <div>
          <h3 className="font-bold text-lg text-neutral-800">
            {user.username}
          </h3>
          <p className="text-sm text-neutral-500">Usuário compatível</p>
          <button
            onClick={handleClick}
            className="mt-2 px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300"
          >
            Message
          </button>
          {clicked && (
            <div className="mt-2" onClick={(e) => e.stopPropagation()}>
              <form
                onSubmit={handleSendMessage}
                className="p-4 -mx-4 border-t border-neutral-200 flex"
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
            </div>
          )}
        </div>
        <div className="text-right">
          <span className="block text-2xl font-bold text-purple-600">
            {percentage}%
          </span>
          <span className="text-xs text-neutral-400 uppercase tracking-wide">
            Afinidade
          </span>
        </div>
      </article>
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-neutral-200 animate-in fade-in slide-in-from-top-1">
          {isLoading && <p>Loading...</p>}
          {isError && <p>Error while loading comparasion details.</p>}
          {details && fixedDetails && !isLoading && !isError && (
            <div className="flex justify-around text-center">
              {Object.entries(fixedDetails).map(([label, score]) => (
                <div key={label}>
                  <span className="block text-xl font-bold text-purple-600">
                    {score}%
                  </span>
                  <span className="text-xs text-neutral-500 uppercase">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
