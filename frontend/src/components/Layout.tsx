import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Topbar from "./Topbar";

function Layout(): React.ReactElement {
  return (
    <div className="min-h-screen font-sans bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50">
      <Topbar />
      <Navbar />
      <main className="w-full max-w-6xl mx-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
