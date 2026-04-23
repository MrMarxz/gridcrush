import { useGameStore } from '../store/game-store';
import { Cell } from './Cell';

export function Board() {
  const board = useGameStore(state => state.board);

  return (
    <div className="grid grid-cols-8 border-2 border-gray-400 bg-gray-300 gap-px">
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
}
