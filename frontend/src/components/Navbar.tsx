import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Navbar(): React.ReactElement {
  const { isAuthenticated, logout } = useAuth();

  const activeClassName = "text-purple-600 dark:text-purple-400 font-semibold";

  return (
    <nav className="bg-white border-b border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800">
      <ul className="flex justify-center items-center gap-6 px-6 py-4 text-neutral-700 dark:text-neutral-200">
        {!isAuthenticated ? (
          <>
            <li>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `hover:text-purple-600 dark:hover:text-purple-400 transition-colors ${isActive ? activeClassName : ""}`
                }
              >
                Login
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `hover:text-purple-600 dark:hover:text-purple-400 transition-colors ${isActive ? activeClassName : ""}`
                }
              >
                Register
              </NavLink>
            </li>
          </>
        ) : (
          <>
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `hover:text-purple-600 dark:hover:text-purple-400 transition-colors ${isActive ? activeClassName : ""}`
                }
              >
                Feed
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/tierlists"
                className={({ isActive }) =>
                  `hover:text-purple-600 dark:hover:text-purple-400 transition-colors ${isActive ? activeClassName : ""}`
                }
              >
                My Tierlists
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/messages"
                className={({ isActive }) =>
                  `hover:text-purple-600 dark:hover:text-purple-400 transition-colors ${isActive ? activeClassName : ""}`
                }
              >
                Messages
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/kin"
                className={({ isActive }) =>
                  `hover:text-purple-600 dark:hover:text-purple-400 transition-colors ${isActive ? activeClassName : ""}`
                }
              >
                Kin
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/account"
                className={({ isActive }) =>
                  `hover:text-purple-600 dark:hover:text-purple-400 transition-colors ${isActive ? activeClassName : ""}`
                }
              >
                Account
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;

