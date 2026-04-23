import { useGameStore } from '../store/game-store';
import { PieceView } from './PieceView';

export function Tray() {
  const tray = useGameStore(state => state.tray);

  return (
    <div className="flex gap-4 mt-4">
      {tray.map((piece, i) => (
        <div
          key={i}
          className="w-60 h-60 flex items-center justify-center bg-gray-100 border-2 border-gray-300 rounded"
        >
          {piece !== null && <PieceView piece={piece} />}
        </div>
      ))}
    </div>
  );
}
