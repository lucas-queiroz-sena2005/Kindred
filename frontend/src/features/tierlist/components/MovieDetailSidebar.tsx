import React from 'react';
import { useTierListPage } from '../context/TierListPageProvider';
import { useTmdbConfig } from '../../../context/TmdbConfigProvider';

export const MovieDetailSidebar: React.FC = () => {
  const { selectedMovie, setSelectedMovie } = useTierListPage();
  const { getImageUrl } = useTmdbConfig();

  const handleClose = () => {
    setSelectedMovie(null);
  };

  if (!selectedMovie) {
    return (
      <div className="w-64 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
        <h3 className="font-bold text-lg mb-2">Movie Details</h3>
        <p className="text-neutral-500">Select a movie to see its details.</p>
      </div>
    );
  }

  const tmdbLink = `https://www.themoviedb.org/movie/${selectedMovie.id}`;
  const imageUrl = getImageUrl(selectedMovie.poster_path || '', 'w342');

  return (
    <div className="w-64 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg relative">
      <button 
        onClick={handleClose} 
        className="absolute top-2 right-2 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 font-bold text-xl"
        aria-label="Close movie details"
      >
        &times;
      </button>
      <h3 className="font-bold text-lg mb-2">{selectedMovie.title} ({selectedMovie.release_year})</h3>
      {imageUrl && (
        <img 
          src={imageUrl} 
          alt={selectedMovie.title} 
          className="w-full rounded-md mb-4" 
        />
      )}
      <a 
        href={tmdbLink} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-purple-600 dark:text-purple-400 hover:underline"
      >
        View on TMDB
      </a>
    </div>
  );
};
