import { useGameStore } from '../store/game-store';

export function GameOverModal() {
  const score = useGameStore(state => state.score);
  const highScore = useGameStore(state => state.highScore);
  const status = useGameStore(state => state.status);
  const reset = useGameStore(state => state.reset);

  if (status !== 'gameover') return null;

  const isNewBest = score > 0 && score === highScore;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl px-10 py-8 flex flex-col items-center gap-4 min-w-64">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Game Over</h2>

        {isNewBest && (
          <div className="bg-yellow-400 text-yellow-900 font-semibold text-sm px-3 py-1 rounded-full">
            New best!
          </div>
        )}

        <div className="flex gap-10 text-center">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-widest">Score</div>
            <div className="text-4xl font-bold tabular-nums text-gray-900">{score}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-widest">Best</div>
            <div className="text-4xl font-bold tabular-nums text-gray-500">{highScore}</div>
          </div>
        </div>

        <button
          onClick={reset}
          className="mt-2 w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl transition-colors"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
