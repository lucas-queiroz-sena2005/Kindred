import React, { useState, useRef, useEffect } from "react";
import ThemeToggleButton from "./ThemeToggleButton";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { useAuth } from "../hooks/useAuth";
import NotificationDropdown from "./NotificationDropdown";

function Topbar(): React.ReactElement {
  const { isAuthenticated } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: notificationCount } = useQuery<number>({
    queryKey: ["notification-count"],
    queryFn: api.notifications.getUnreadCount,
    enabled: isAuthenticated,
    initialData: 0,
    refetchInterval: 5000,
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
      </div>
    </header>
  );
}

export default Topbar;
