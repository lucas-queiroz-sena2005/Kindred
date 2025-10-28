import { Draggable } from "@hello-pangea/dnd";

interface DataCardProps {
  id: string;
  index: number;
  imageUrl: string;
}

export default function DataCard({ id, index, imageUrl }: DataCardProps) {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <img className="w-16" src={imageUrl} />
        </div>
      )}
    </Draggable>
  );
}
