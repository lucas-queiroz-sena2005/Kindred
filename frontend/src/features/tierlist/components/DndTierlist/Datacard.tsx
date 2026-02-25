import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Movie } from "../../../../types/tierlist";
import { useTmdbConfig } from "../../../../context/TmdbConfigProvider";
import ImagePlaceholder from "../../../../assets/image_placeholder.png"; // Import the placeholder image

interface DataCardProps {
  item: Movie;
  index: number;
  onMovieSelect?: (movie: Movie) => void;
}

export default function DataCard({
  item,
  index,
  onMovieSelect,
}: DataCardProps): React.ReactElement {
  const { getImageUrl } = useTmdbConfig();
  const imageUrl = getImageUrl(item.poster_path || "");

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    e.currentTarget.src = ImagePlaceholder;
  };

  return (
    <Draggable draggableId={String(item.id)} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          // logic: Trigger selection on click to avoid complex onMouseDown issues
          onClick={() => onMovieSelect?.(item)}
          className="cursor-pointer active:cursor-grabbing focus:outline-none"
        >
          <img
            className="w-16 rounded shadow-sm"
            src={imageUrl}
            alt={item.title}
            onError={handleImageError}
          />
        </div>
      )}
    </Draggable>
  );
}
