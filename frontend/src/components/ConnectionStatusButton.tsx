import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";

interface ConnectionStatusButtonProps {
  targetId: number;
}

function ConnectionStatusButton({
  targetId,
}: ConnectionStatusButtonProps): React.ReactElement {
  const queryClient = useQueryClient();

  const { data: status, isLoading } = useQuery({
    queryKey: ["connectionStatus", targetId],
    queryFn: () => api.connections.getStatus(targetId),
    refetchInterval: 3000,
  });

  const askMutation = useMutation({
    mutationFn: () => api.connections.ask(targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectionStatus", targetId] });
      queryClient.invalidateQueries({ queryKey: ["kin"] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.connections.cancel(targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectionStatus", targetId] });
      queryClient.invalidateQueries({ queryKey: ["kin"] });
    },
  });

  const blockMutation = useMutation({
    mutationFn: () => api.connections.block(targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectionStatus", targetId] });
      queryClient.invalidateQueries({ queryKey: ["kin"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => api.connections.reject(targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectionStatus", targetId] });
      queryClient.invalidateQueries({ queryKey: ["kin"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const unblockMutation = useMutation({
    mutationFn: () => api.connections.unblock(targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectionStatus", targetId] });
      queryClient.invalidateQueries({ queryKey: ["kin"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  if (isLoading) {
    return <button className="text-sm text-neutral-500" disabled>Loading...</button>;
  }

  const renderButton = () => {
    switch (status?.status) {
      case "connected":
        return (
          <>
            <button
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
              className="text-sm text-red-500 hover:text-red-700 ml-4"
            >
              {cancelMutation.isPending ? "Disconnecting..." : "Disconnect"}
            </button>
            <button
              onClick={() => blockMutation.mutate()}
              disabled={blockMutation.isPending}
              className="text-sm text-red-500 hover:text-red-700 ml-4"
            >
              {blockMutation.isPending ? "Blocking..." : "Block"}
            </button>
          </>
        );
      case "pending_from_user":
        return (
          <button className="text-sm text-neutral-500 ml-4" disabled>
            Request Sent
          </button>
        );
      case "pending_from_target":
        return (
          <>
            <button
              onClick={() => askMutation.mutate()}
              disabled={askMutation.isPending}
              className="text-sm text-purple-600 hover:text-purple-800 ml-4"
            >
              {askMutation.isPending ? "Accepting..." : "Accept"}
            </button>
            <button
              onClick={() => rejectMutation.mutate()}
              disabled={rejectMutation.isPending}
              className="text-sm text-red-500 hover:text-red-700 ml-4"
            >
              {rejectMutation.isPending ? "Rejecting..." : "Reject"}
            </button>
          </>
        );
      case "not_connected":
        return (
          <>
            <button
              onClick={() => askMutation.mutate()}
              disabled={askMutation.isPending}
              className="text-sm text-purple-600 hover:text-purple-800 ml-4"
            >
              {askMutation.isPending ? "Connecting..." : "Connect"}
            </button>
            <button
              onClick={() => blockMutation.mutate()}
              disabled={blockMutation.isPending}
              className="text-sm text-red-500 hover:text-red-700 ml-4"
            >
              {blockMutation.isPending ? "Blocking..." : "Block"}
            </button>
          </>
        );
      case "blocked":
        if (status.am_i_blocker) {
          return (
            <button
              onClick={() => unblockMutation.mutate()}
              disabled={unblockMutation.isPending}
              className="text-sm text-red-500 hover:text-red-700 ml-4"
            >
              {unblockMutation.isPending ? "Unblocking..." : "Unblock"}
            </button>
          );
        }
        return <span className="text-sm text-red-500 ml-4">Blocked</span>;
      default:
        return null;
    }
  };

  return <div className="ml-4 flex items-center">{renderButton()}</div>;
}

export default ConnectionStatusButton;
