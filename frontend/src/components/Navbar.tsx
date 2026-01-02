import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Navbar(): React.ReactElement {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800">
      <ul className="flex justify-center items-center gap-6 px-6 py-4 text-neutral-700 dark:text-neutral-200">
        {!isAuthenticated ? (
          <>
            <li>
              <Link
                to="/login"
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <span className="inline-block mr-2"></span> Login
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <span className="inline-block mr-2"></span> Register
              </Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link
                to="/"
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <span className="inline-block mr-2"></span> Feed
              </Link>
            </li>
            <li>
              <Link
                to="/tierlists"
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <span className="inline-block mr-2"></span> My Tierlists
              </Link>
            </li>
            <li>
              <Link
                to="/messages"
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <span className="inline-block mr-2"></span> Messages
              </Link>
            </li>
            <li>
              <Link
                to="/kin"
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <span className="inline-block mr-2"></span> Kin
              </Link>
            </li>
            <li>
              <Link
                to="/account"
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <span className="inline-block mr-2"></span> Account
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
