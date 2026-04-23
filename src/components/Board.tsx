import { forwardRef } from 'react';
import { useGameStore } from '../store/game-store';
import { Cell } from './Cell';

// Plain grid — no border or gap — so getBoundingClientRect().left/top are exactly
// the origin for drop-target maths: col = floor((x - left) / 48).
export const Board = forwardRef<HTMLDivElement>(function Board(_, ref) {
  const board = useGameStore(state => state.board);
  const clearing = useGameStore(state => state.clearing);

  return (
    <div ref={ref} className="grid grid-cols-8">
      {board.map((row, r) =>
        row.map((cell, c) => (
          <Cell
            key={`${r}-${c}`}
            filled={cell.filled}
            color={cell.filled ? cell.color : undefined}
            flashing={clearing.has(`${r},${c}`)}
          />
        ))
      )}
    </div>
  );
});

Board.displayName = 'Board';
