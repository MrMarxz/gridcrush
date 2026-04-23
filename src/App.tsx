import { useEffect } from 'react';
import { useGameStore } from './store/game-store';

function App() {
  const state = useGameStore();

  useEffect(() => {
    console.log('[sanity] initial state:', {
      score: state.score,
      tray: state.tray.map(p => p ? { color: p.color, cells: p.shape.length } : null),
    });

    const trayIndex = state.tray.findIndex(p => p !== null);
    if (trayIndex !== -1) {
      console.log('[sanity] placing tray piece', trayIndex, 'at (0,0)');
      state.placePiece(trayIndex, 0, 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log('[sanity] state after change:', {
      score: state.score,
      tray: state.tray.map(p => p ? { color: p.color, cells: p.shape.length } : null),
      filledCells: state.board.flat().filter(c => c.filled).length,
    });
  }, [state.score, state.tray, state.board]);

  return <div>GridCrush</div>;
}

export default App;
