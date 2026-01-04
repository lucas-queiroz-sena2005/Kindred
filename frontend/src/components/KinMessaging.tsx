import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import ErrorMessage from "./ErrorMessage";

interface KinMessagingProps {
  targetId: number;
}

export function KinMessaging({
  targetId,
}: KinMessagingProps): React.ReactElement {
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newMessage: string) =>
      api.messages.sendMessage(targetId, newMessage),
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["messages", targetId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      mutation.mutate(message);
    }
  };

  return (
    <div className="mt-2" onClick={(e) => e.stopPropagation()}>
      <form
        onSubmit={handleSendMessage}
        className="border border-neutral-200 rounded-lg flex"
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Send a quick message..."
          className="w-full px-4 py-2 bg-white rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={mutation.isPending}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700 disabled:bg-purple-400"
          disabled={mutation.isPending || !message.trim()}
        >
          {mutation.isPending ? "..." : "Send"}
        </button>
      </form>
      {mutation.isError && <ErrorMessage message="Failed to send message." />}
    </div>
  );
}
