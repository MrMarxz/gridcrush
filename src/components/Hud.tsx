import { useGameStore } from '../store/game-store';

export function Hud() {
  const score = useGameStore(state => state.score);
  const highScore = useGameStore(state => state.highScore);
  const muted = useGameStore(state => state.muted);
  const toggleMute = useGameStore(state => state.toggleMute);

  return (
    <div className="flex items-center justify-between w-full max-w-sm mb-1">
      <div className="flex gap-8">
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-widest">Score</div>
          <div className="text-3xl font-bold tabular-nums text-white">{score}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-widest">Best</div>
          <div className="text-3xl font-bold tabular-nums text-slate-300">{highScore}</div>
        </div>
      </div>
      <button
        onClick={toggleMute}
        className="px-3 py-1 rounded-lg border border-slate-600 text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors"
        aria-label={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? 'Muted' : 'Sound'}
      </button>
    </div>
  );
}
