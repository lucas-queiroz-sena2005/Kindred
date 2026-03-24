import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useAuth } from "@/hooks/useAuth";
import Footer from "./Footer";
import Navbar from "./Navbar";
import Topbar from "./Topbar";

function Layout(): React.ReactElement {
  const { isAuthenticated } = useAuth();
  const { data: notificationCount } = useQuery<number>({
    queryKey: ["notification-count"],
    queryFn: api.notifications.getUnreadCount,
    enabled: isAuthenticated,
    initialData: 0,
  });

  useEffect(() => {
    if (notificationCount && notificationCount > 0) {
      document.title = `(${notificationCount}) Kindred`;
    } else {
      document.title = "Kindred";
    }
  }, [notificationCount]);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-neutral-50 font-sans text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50">
      <Topbar />
      <Navbar />
      <main className="mx-auto min-w-0 w-full max-w-6xl px-4 pb-24 pt-36 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
