import React from "react";
import { Link } from "react-router-dom";
<<<<<<< HEAD
import { useAuth } from "../hooks/useAuth";

function Navbar(): React.ReactElement {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-10">
      <ul className="flex items-center justify-center space-x-8 h-12 text-sm font-medium text-neutral-600">
        {!isAuthenticated ? (
          <>
            <li>
              <Link to="/login" className="hover:text-purple-600 transition-colors">
                Login
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-purple-600 transition-colors">
                Register
              </Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/" className="hover:text-purple-600 transition-colors">
                Feed
              </Link>
            </li>
            <li>
              <Link
                to="/tierlists"
                className="hover:text-purple-600 transition-colors"
              >
                My Tierlists
              </Link>
            </li>
            <li>
              <Link to="/kin" className="hover:text-purple-600 transition-colors">
                My Kin
              </Link>
            </li>
            <li>
              <Link
                to="/account"
                className="hover:text-purple-600 transition-colors"
              >
                My Account
              </Link>
            </li>
            <li>
              <button
                onClick={logout}
                className="hover:text-purple-600 transition-colors"
              >
                Logout
              </button>
            </li>
          </>
        )}
=======

function Navbar(): React.ReactElement {
  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-10">
      <ul className="flex items-center justify-center space-x-8 h-12 text-sm font-medium text-neutral-600">
        <li>
          <Link to="/" className="hover:text-purple-600 transition-colors">
            Feed
          </Link>
        </li>
        <li>
          <Link
            to="/tierlists"
            className="hover:text-purple-600 transition-colors"
          >
            My Tierlists
          </Link>
        </li>
        <li>
          <Link to="/kin" className="hover:text-purple-600 transition-colors">
            My Kin
          </Link>
        </li>
        <li>
          <Link
            to="/account"
            className="hover:text-purple-600 transition-colors"
          >
            My Account
          </Link>
        </li>
>>>>>>> main
      </ul>
    </nav>
  );
}

export default Navbar;
