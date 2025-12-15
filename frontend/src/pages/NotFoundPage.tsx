<<<<<<< HEAD
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <h1 className="text-8xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">Page Not Found</h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Sorry, but the page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
      >
        Go Back to Home
      </Link>
    </div>
  );
};
=======
import React from "react";
import { Link } from "react-router-dom";

function NotFoundPage(): React.ReactElement {
  return (
    <div>
      <h1>404</h1>
      <p>Page Not Found</p>
      <Link to="/">Go to Homepage</Link>
    </div>
  );
}
>>>>>>> main

export default NotFoundPage;
