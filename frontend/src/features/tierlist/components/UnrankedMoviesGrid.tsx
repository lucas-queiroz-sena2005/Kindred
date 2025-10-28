import React from "react";
import type { Movie } from "../../../types/tierlist";

interface UnrankedMovieItemProps {
  movie: Movie;
  onSelect: () => void;
}

function UnrankedMovieItem({ movie, onSelect }: UnrankedMovieItemProps) {
  return (
    <button
      onClick={onSelect}
      className="aspect-[2/3] bg-gray-700 rounded overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 relative group"
    >
      <img src={movie.poster_path || ""} alt={movie.title} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-sm p-2 text-center">
        Tap to rank
      </div>
    </button>
  );
}

interface UnrankedMoviesGridProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
}

export default function UnrankedMoviesGrid({ movies, onSelectMovie }: UnrankedMoviesGridProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
      {movies.map((movie) => (
        <UnrankedMovieItem key={movie.id} movie={movie} onSelect={() => onSelectMovie(movie)} />
      ))}
    </div>
  );
}
