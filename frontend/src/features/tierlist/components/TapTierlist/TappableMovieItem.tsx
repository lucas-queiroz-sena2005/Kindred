import React from "react";
import type { Movie } from "@/types/tierlist";
import { useTmdbConfig } from "@/shared/context/TmdbConfigProvider";

interface TappableMovieItemProps {
  movie: Movie;
  onSelect: (movie: Movie) => void;
  sizeClass?: string; // Optional prop for different sizes, defaults to w-20 h-28
}

export default function TappableMovieItem({ movie, onSelect, sizeClass }: TappableMovieItemProps) {
  const { getImageUrl } = useTmdbConfig();
  const sizeClasses = sizeClass ?? "w-14 h-20 sm:w-20 sm:h-28";

  return (
    <button
      onClick={() => onSelect(movie)}
      className={`${sizeClasses} flex-shrink-0 bg-gray-800 rounded overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 relative group`}
    >
      <img src={getImageUrl(movie.poster_path || "")} alt={movie.title} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-sm p-2 text-center">
        Tap to rank
      </div>
    </button>
  );
}