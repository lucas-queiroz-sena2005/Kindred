import React from 'react';
import { Movie } from '../../../types/tierlist';
import { useTmdbConfig } from '../../../context/TmdbConfigProvider';

interface MovieDetailSidebarProps {
  movie: Movie | null;
  onClose: () => void;
}

export const MovieDetailSidebar: React.FC<MovieDetailSidebarProps> = ({ movie, onClose }) => {
  const { getImageUrl } = useTmdbConfig();

  if (!movie) {
    return (
      <div className="w-64 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="font-bold text-lg mb-2">Movie Details</h3>
        <p className="text-gray-500">Select a movie to see its details.</p>
      </div>
    );
  }

  const tmdbLink = `https://www.themoviedb.org/movie/${movie.id}`;

  return (
    <div className="w-64 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg relative">
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 font-bold text-xl">&times;</button>
      <h3 className="font-bold text-lg mb-2">{movie.title} ({movie.release_year})</h3>
      <img src={getImageUrl(movie.poster_path || '', 'w342')} alt={movie.title} className="w-full rounded-md mb-4" />
      <a href={tmdbLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
        View on TMDB
      </a>
    </div>
  );
};
