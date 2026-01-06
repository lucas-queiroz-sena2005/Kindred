import React from "react";
import { useAuth } from "../hooks/useAuth";

function AccountPage(): React.ReactElement {
  const { logout } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-neutral-800 dark:text-neutral-200">
        My Account
      </h1>
      <div className="bg-white dark:bg-neutral-800 shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-neutral-700 dark:text-neutral-300">
          Settings
        </h2>
        <button
          onClick={logout}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default AccountPage;
