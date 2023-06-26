import { useState } from 'react';

interface DraggableData {
  id: number;
  content: string;
}

interface Props {
  item: DraggableData | null;
  setItem: React.Dispatch<React.SetStateAction<DraggableData | null>>;
}

export const DragAndDrop = () => {
  const [draggedItem, setDraggedItem] = useState<DraggableData | null>(null);
  const [item, setItem] = useState<DraggableData | null>(null);

  console.log(draggedItem);
  console.log(item);

  const handleDragStart = (
    _event: React.DragEvent<HTMLDivElement>,
    item: DraggableData
  ) => {
    setDraggedItem(item);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (draggedItem) {
      setItem(draggedItem);
      setDraggedItem(null);
    }
  };

  return (
    <div>
      <div
        style={{
          width: '100px',
          height: '100px',
          border: '1px solid black',
        }}
        draggable
        onDragStart={(event) =>
          handleDragStart(event, { id: 1, content: 'Draggable Item' })
        }
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {item ? item.content : 'Drop Here'}
      </div>
    </div>
  );
};

export default DragAndDrop;
