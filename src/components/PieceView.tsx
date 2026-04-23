import type { Piece } from '../game/types';
import { Cell } from './Cell';

// Written out fully so Tailwind's scanner includes them.
const GRID_COLS_CLASS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
};

type Props = {
  piece: Piece;
};

export function PieceView({ piece }: Props) {
  const rows = Math.max(...piece.shape.map(o => o.row)) + 1;
  const cols = Math.max(...piece.shape.map(o => o.col)) + 1;
  const colsClass = GRID_COLS_CLASS[cols] ?? 'grid-cols-5';
  const occupied = new Set(piece.shape.map(o => `${o.row},${o.col}`));

  return (
    <div className={`grid ${colsClass}`}>
      {Array.from({ length: rows * cols }, (_, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        return occupied.has(`${r},${c}`) ? (
          <Cell key={`${r}-${c}`} filled color={piece.color} />
        ) : (
          <div key={`${r}-${c}`} className="w-12 h-12" />
        );
      })}
    </div>
  );
}
