import { forwardRef } from 'react';
import { useGameStore } from '../store/game-store';
import { Cell } from './Cell';

// The outer wrapper in App.tsx owns the decorative frame.
// This element is a plain grid so getBoundingClientRect().left/top are
// exactly the origin for drop-target math: col = floor((x - left) / 48).
export const Board = forwardRef<HTMLDivElement>(function Board(_, ref) {
  const board = useGameStore(state => state.board);

  return (
    <div ref={ref} className="grid grid-cols-8">
      {board.map((row, r) =>
        row.map((cell, c) => (
          <Cell
            key={`${r}-${c}`}
            filled={cell.filled}
            color={cell.filled ? cell.color : undefined}
          />
        ))
      )}
    </div>
  );
});

Board.displayName = 'Board';
