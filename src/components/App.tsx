import { useGameStore } from '../store/game-store';
import { Hud } from './Hud';
import { Board } from './Board';
import { Tray } from './Tray';

export default function App() {
  const reset = useGameStore(state => state.reset);

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center justify-center p-8 gap-2">
      <Hud />
      <Board />
      <Tray />
      <button
        onClick={reset}
        className="mt-4 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded text-sm font-medium"
      >
        New Game
      </button>
    </div>
  );
}
