import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import ErrorMessage from "@/shared/ui/ErrorMessage";
import { cn } from "@/shared/lib/cn";
import { tw } from "@/shared/lib/tw";

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
        className="flex rounded-lg border border-neutral-200 dark:border-neutral-600"
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Send a quick message..."
          className={cn(
            "w-full rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500",
            "bg-white text-neutral-900 placeholder:text-neutral-500 dark:bg-neutral-700 dark:text-neutral-100 dark:placeholder:text-neutral-400",
          )}
          disabled={mutation.isPending}
        />
        <button
          type="submit"
          className={cn(tw.btnPrimary, "rounded-l-none rounded-r-lg px-4 py-2")}
          disabled={mutation.isPending || !message.trim()}
        >
          {mutation.isPending ? "..." : "Send"}
        </button>
      </form>
      {mutation.isError && <ErrorMessage message="Failed to send message." />}
    </div>
  );
}
