import React, { useState, useRef, useEffect } from "react";
import ThemeToggleButton from "./ThemeToggleButton";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "../api";
import { useAuth } from "../hooks/useAuth";
import NotificationDropdown from "./NotificationDropdown";

function Topbar(): React.ReactElement {
  const { isAuthenticated } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const queryClient = useQueryClient();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  const { data: notificationCount } = useQuery<number>({
    queryKey: ["notification-count"],
    queryFn: api.notifications.getUnreadCount,
    enabled: isAuthenticated,
    initialData: 0,
  });

  const markAsReadMutation = useMutation({
    mutationFn: api.notifications.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-count"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else if (!isDropdownOpen && isAuthenticated) {
      markAsReadMutation.mutate();
    }
  }, [isDropdownOpen, isAuthenticated, markAsReadMutation]);

  return (
    <header className="bg-neutral-100 border-b border-neutral-200 dark:bg-neutral-950 dark:border-neutral-800">
      <div className="mx-auto flex items-center gap-4 p-4">
        <h1 className="text-2xl font-bold tracking-tight">Kindred</h1>

        <div className="flex-1"></div>

        {isAuthenticated && (
          <div className="relative" ref={dropdownRef}>
            <button onClick={toggleDropdown} className="text-xl">
              <span>🔔</span>
              <span className="text-xs">{notificationCount}</span>
            </button>
            {isDropdownOpen && <NotificationDropdown />}
          </div>
        )}
        <ThemeToggleButton />
      </div>
    </header>
  );
}

export default Topbar;
