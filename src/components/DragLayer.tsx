import type { RefObject } from 'react';
import type { Piece } from '../game/types';
import { PieceView } from './PieceView';

const CELL_SIZE = 48;

type Props = {
  piece: Piece;
  targetCell: { row: number; col: number };
  boardRef: RefObject<HTMLDivElement | null>;
  isValid: boolean;
};

export function DragLayer({ piece, targetCell, boardRef, isValid }: Props) {
  const boardEl = boardRef.current;
  if (!boardEl) return null;

  const rect = boardEl.getBoundingClientRect();
  const left = rect.left + targetCell.col * CELL_SIZE;
  const top = rect.top + targetCell.row * CELL_SIZE;

  // For invalid placements override the colour to red so the ghost reads clearly.
  const ghostPiece: Piece = isValid ? piece : { ...piece, color: 'red' };

  return (
    <div
      style={{ position: 'fixed', left, top, pointerEvents: 'none', zIndex: 50 }}
      className="opacity-50"
    >
      <PieceView piece={ghostPiece} />
    </div>
  );
}
