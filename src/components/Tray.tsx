import { useDraggable } from '@dnd-kit/core';
import { useGameStore } from '../store/game-store';
import { PieceView } from './PieceView';
import type { Piece } from '../game/types';

type SlotProps = { piece: Piece; trayIndex: number };

function DraggablePiece({ piece, trayIndex }: SlotProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: String(trayIndex),
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`touch-none cursor-grab select-none ${isDragging ? 'opacity-25' : ''}`}
    >
      <PieceView piece={piece} />
    </div>
  );
}

export function Tray() {
  const tray = useGameStore(state => state.tray);

  return (
    <div className="flex gap-3 mt-2">
      {tray.map((piece, i) => (
        <div
          key={i}
          className="w-60 h-60 flex items-center justify-center bg-slate-700 rounded-xl border border-slate-600"
        >
          {piece !== null && <DraggablePiece piece={piece} trayIndex={i} />}
        </div>
      ))}
    </div>
  );
}
