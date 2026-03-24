import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/api";
import type { Notification } from "@/types/notifications";

type GroupedNotification = Notification & { count?: number };

const getNotificationMessage = (
  notification: GroupedNotification,
): string => {
  if (
    notification.type === "new_message" &&
    notification.count &&
    notification.count > 1
  ) {
    return `You have ${notification.count} new messages from ${notification.actor_username}.`;
  }
  switch (notification.type) {
    case "kin_request":
      return `${notification.actor_username} sent you a kin request.`;
    case "kin_accepted":
      return `${notification.actor_username} accepted your kin request.`;
    case "new_message":
      return `You have a new message from ${notification.actor_username}.`;
    default:
      return "You have a new notification.";
  }
};

const getNotificationLink = (notification: Notification): string => {
  switch (notification.type) {
    case "kin_request":
      return `/messages/${notification.actor_id}`;
    case "kin_accepted":
      return "/kin";
    case "new_message":
      return `/messages/${notification.actor_id}`;
    default:
      return "/";
  }
};

const groupNotifications = (
  notifications: Notification[],
): GroupedNotification[] => {
  const unreadMessageNotifications = notifications.filter(
    (n) => n.type === "new_message" && !n.is_read,
  );
  const otherNotifications = notifications.filter(
    (n) => n.type !== "new_message" || n.is_read,
  );

  const groupedMessages = unreadMessageNotifications.reduce(
    (acc, notification) => {
      if (acc[notification.actor_id]) {
        acc[notification.actor_id].count!++;
        if (
          new Date(notification.created_at) >
          new Date(acc[notification.actor_id].created_at)
        ) {
          acc[notification.actor_id].created_at = notification.created_at;
        }
      } else {
        acc[notification.actor_id] = { ...notification, count: 1 };
      }
      return acc;
    },
    {} as Record<number, GroupedNotification>,
  );

  return [...Object.values(groupedMessages), ...otherNotifications].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
};

function NotificationDropdown(): React.ReactElement {
  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: api.notifications.getNotifications,
  });

  const groupedNotifications = notifications
    ? groupNotifications(notifications)
    : [];

  return (
    <div className="absolute right-0 top-full z-[100] mt-1 flex max-h-[min(70vh,24rem)] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-md border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800 sm:right-0 sm:mt-1">
      <div className="flex-shrink-0 border-b border-neutral-200 p-4 dark:border-neutral-700">
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
          Notifications
        </h3>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <p className="px-4 py-2 text-neutral-600 dark:text-neutral-400">
            Loading...
          </p>
        ) : groupedNotifications && groupedNotifications.length > 0 ? (
          groupedNotifications.slice(0, 10).map((notification) => (
            <Link
              to={getNotificationLink(notification)}
              key={notification.id}
              className={`block rounded-md px-4 py-2 text-neutral-800 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700 ${
                !notification.is_read
                  ? "bg-purple-100 dark:bg-purple-900/50"
                  : ""
              }`}
            >
              <p className="text-sm">{getNotificationMessage(notification)}</p>
            </Link>
          ))
        ) : (
          <p className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400">
            No new notifications.
          </p>
        )}
      </div>
    </div>
  );
}

export default NotificationDropdown;
