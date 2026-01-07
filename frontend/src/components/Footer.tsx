import React from "react";
import tmdbLogo from "../assets/tmdblogo.svg";

const Footer: React.FC = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 z-10">
      <div className="w-full max-w-6xl mx-auto p-4 text-xs text-neutral-500">
        <div className="flex justify-between items-center">
          <div>
            <a
              href="https://github.com/lucas-queiroz-sena2005"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              https://github.com/lucas-queiroz-sena2005
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <p>
              This product uses the TMDB API but is not endorsed or certified by
              TMDB.
            </p>
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={tmdbLogo} alt="TMDB Logo" className="h-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
