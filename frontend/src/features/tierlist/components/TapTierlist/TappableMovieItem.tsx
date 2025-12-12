import React from "react";
import type { Movie } from "../../../../types/tierlist";

interface TappableMovieItemProps {
  movie: Movie;
  onSelect: (movie: Movie) => void;
  sizeClass?: string; // Optional prop for different sizes, defaults to w-20 h-28
}

export default function TappableMovieItem({ movie, onSelect, sizeClass = "w-20 h-28" }: TappableMovieItemProps) {
  return (
    <button
      onClick={() => onSelect(movie)}
      className={`${sizeClass} flex-shrink-0 bg-gray-800 rounded overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 relative group`}
    >
      <img src={movie.poster_path || ""} alt={movie.title} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-sm p-2 text-center">
        Tap to rank
      </div>
    </button>
  );
}