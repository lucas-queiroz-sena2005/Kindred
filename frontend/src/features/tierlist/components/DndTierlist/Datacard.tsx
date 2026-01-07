import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Movie } from "../../../../types/tierlist";
import { useTmdbConfig } from "../../../../context/TmdbConfigProvider";
import ImagePlaceholder from '../../../../assets/image_placeholder.png'; // Import the placeholder image

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

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = ImagePlaceholder; // Set the placeholder image on error
  };

  return (
    <Draggable draggableId={String(item.id)} index={index}>
      {(provided) => {
        // Create a custom onMouseDown handler to select the movie
        // before the drag starts, without breaking dnd.
        const handleMouseDown = (e: React.MouseEvent) => {
          if (onMovieSelect) {
            onMovieSelect(item);
          }
          // Make sure to call the original onMouseDown from the library
          if (provided.dragHandleProps?.onMouseDown) {
            provided.dragHandleProps.onMouseDown(e);
          }
        };

        const customDragHandleProps = {
          ...provided.dragHandleProps,
          onMouseDown: handleMouseDown,
        };

        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...customDragHandleProps}
            className="cursor-pointer"
          >
            <img className="w-16" src={imageUrl} alt={item.title} onError={handleImageError} />
          </div>
        );
      }}
    </Draggable>
  );
}
