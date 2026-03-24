import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/shared/lib/cn";
import { tw } from "@/shared/lib/tw";

function Navbar(): React.ReactElement {
  const { isAuthenticated } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(tw.navLink, isActive && tw.navLinkActive);

  return (
    <nav className={tw.navShell}>
      <ul className="flex h-full w-full flex-wrap items-center justify-center gap-4 px-4 py-0 text-neutral-700 sm:gap-6 sm:px-6 dark:text-neutral-200">
        {!isAuthenticated ? (
          <>
            <li>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
            </li>
            <li>
              <NavLink to="/register" className={linkClass}>
                Register
              </NavLink>
            </li>
          </>
        ) : (
          <>
            <li>
              <NavLink to="/" end className={linkClass}>
                Feed
              </NavLink>
            </li>
            <li>
              <NavLink to="/tierlists" className={linkClass}>
                My Tierlists
              </NavLink>
            </li>
            <li>
              <NavLink to="/messages" className={linkClass}>
                Messages
              </NavLink>
            </li>
            <li>
              <NavLink to="/kin" className={linkClass}>
                Kin
              </NavLink>
            </li>
            <li>
              <NavLink to="/account" className={linkClass}>
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
