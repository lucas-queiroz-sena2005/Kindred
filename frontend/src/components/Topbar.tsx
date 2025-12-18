import React from "react";
import ThemeToggleButton from "./ThemeToggleButton";

function Topbar(): React.ReactElement {
  return (
    <header className="bg-neutral-100 border-b border-neutral-200 dark:bg-neutral-950 dark:border-neutral-800">
      <div className="mx-auto flex items-center gap-4 p-4">
        <h1 className="text-2xl font-bold tracking-tight">Kindred</h1>

        <div className="flex-1 max-w-xl">
          <input
            type="search"
            placeholder="Search a tierlist..."
            className="w-full px-4 py-2 rounded-md bg-white text-neutral-900 border border-neutral-300 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-700 dark:placeholder-neutral-400"
          />
        </div>

        <ThemeToggleButton />
      </div>
    </header>
  );
}

export default Topbar;
