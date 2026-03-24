import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useAuth } from "@/hooks/useAuth";
import NotificationDropdown from "@/features/notifications/NotificationDropdown";
import { tw } from "@/shared/lib/tw";

function Topbar(): React.ReactElement {
  const { isAuthenticated, user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: notificationCount } = useQuery<number>({
    queryKey: ["notification-count"],
    queryFn: api.notifications.getUnreadCount,
    enabled: isAuthenticated,
    initialData: 0,
    refetchInterval: 5000,
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className={tw.topbarShell}>
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-shrink-0 items-center gap-2 md:gap-3">
          <h1 className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
            Kindred
          </h1>
          <span
            className="hidden h-5 w-px shrink-0 bg-neutral-300 md:block dark:bg-neutral-600"
            aria-hidden
          />
          <p className="hidden max-w-[12rem] text-sm leading-tight text-neutral-500 md:block md:max-w-[14rem] lg:max-w-md dark:text-neutral-400">
            Match on taste. Connect on film.
          </p>
        </div>

        <div className="hidden min-w-0 flex-1 sm:block" />

        {isAuthenticated && user && (
          <p className="hidden min-w-0 max-w-[10rem] truncate text-sm text-neutral-600 lg:block dark:text-neutral-400 xl:max-w-xs">
            <span className="text-neutral-500 dark:text-neutral-500">
              Signed in as{" "}
            </span>
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              {user.username}
            </span>
          </p>
        )}

        <div className="flex-1 sm:hidden" />

        {isAuthenticated && (
          <div className="relative flex-shrink-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((o) => !o)}
              className="relative rounded-lg p-2 text-xl hover:bg-neutral-200/80 dark:hover:bg-neutral-800"
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
              aria-label="Notifications"
            >
              <span aria-hidden>🔔</span>
              {notificationCount != null && notificationCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-purple-600 px-1 text-[10px] font-semibold text-white">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </button>
            {isDropdownOpen && <NotificationDropdown />}
          </div>
        )}
      </div>
    </header>
  );
}

export default Topbar;
