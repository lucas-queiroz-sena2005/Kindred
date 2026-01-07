import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Topbar from "./Topbar";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { useAuth } from "../hooks/useAuth";
import Footer from "./Footer";

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
    <div className="min-h-screen font-sans bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50 flex flex-col">
      <Topbar />
      <Navbar />
      <main className="w-full max-w-6xl mx-auto px-8 pt-36 pb-24">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
