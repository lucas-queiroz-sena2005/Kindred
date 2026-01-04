import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../api";
import { Notification } from "../types/notifications";

type GroupedNotification = Notification & { count?: number };

const getNotificationMessage = (notification: GroupedNotification): string => {
  if (notification.type === "new_message" && notification.count && notification.count > 1) {
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

const groupNotifications = (notifications: Notification[]): GroupedNotification[] => {
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
        if (new Date(notification.created_at) > new Date(acc[notification.actor_id].created_at)) {
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
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
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
    <div className="absolute top-16 right-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-lg w-80">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <h3 className="font-semibold">Notifications</h3>
      </div>
      <div className="p-4">
        {isLoading ? (
          <p>Loading...</p>
        ) : groupedNotifications && groupedNotifications.length > 0 ? (
          groupedNotifications.slice(0, 10).map((notification) => (
            <Link
              to={getNotificationLink(notification)}
              key={notification.id}
              className={`block py-2 px-4 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                !notification.is_read
                  ? "bg-purple-100 dark:bg-purple-900"
                  : ""
              }`}
            >
              <p>{getNotificationMessage(notification)}</p>
            </Link>
          ))
        ) : (
          <p>No new notifications.</p>
        )}
      </div>
    </div>
  );
}

export default NotificationDropdown;
