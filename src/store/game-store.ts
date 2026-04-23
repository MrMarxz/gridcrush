import { create } from 'zustand';
import { createEmptyBoard } from '../game/types';
import type { Board, Piece } from '../game/types';
import { isValidPlacement, placePiece as applyPlacement } from '../game/placement';
import { findClearedLines, clearLines } from '../game/clearing';
import { computePlacementPoints, computeClearPoints } from '../game/scoring';
import { hasAnyValidMove } from '../game/gameover';
import { randomPiece } from '../game/pieces';
import { mathRandom } from '../game/rng';
import { playPlace, playClear, playGameOver } from '../audio/sounds';

const HS_KEY = 'gridcrush:highscore:v1';
const MUTE_KEY = 'gridcrush:muted:v1';
const BOARD_SIZE = 8;
const CLEAR_FLASH_MS = 200;

function loadHighScore(): number {
  try {
    const raw = localStorage.getItem(HS_KEY);
    if (raw === null) return 0;
    const n = parseInt(raw, 10);
    return isNaN(n) ? 0 : n;
  } catch {
    return 0;
  }
}

function loadMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === 'true';
  } catch {
    return false;
  }
}

function generateTray(): [Piece, Piece, Piece] {
  return [randomPiece(mathRandom), randomPiece(mathRandom), randomPiece(mathRandom)];
}

function buildClearingSet(rows: number[], cols: number[]): Set<string> {
  const s = new Set<string>();
  for (const r of rows) {
    for (let c = 0; c < BOARD_SIZE; c++) s.add(`${r},${c}`);
  }
  for (const c of cols) {
    for (let r = 0; r < BOARD_SIZE; r++) s.add(`${r},${c}`);
  }
  return s;
}

export type GameState = {
  board: Board;
  tray: (Piece | null)[];
  score: number;
  highScore: number;
  comboLevel: number;
  status: 'playing' | 'gameover';
  muted: boolean;
  // Coordinates of cells currently flashing white before disappearing.
  // Purely visual — the board cells are already cleared when this is set.
  clearing: ReadonlySet<string>;

  placePiece: (trayIndex: number, row: number, col: number) => void;
  reset: () => void;
  toggleMute: () => void;
};

export const useGameStore = create<GameState>()((set, get) => ({
  board: createEmptyBoard(),
  tray: generateTray(),
  score: 0,
  highScore: loadHighScore(),
  comboLevel: 1,
  status: 'playing',
  muted: loadMuted(),
  clearing: new Set<string>(),

  placePiece(trayIndex, row, col) {
    const { board, tray, score, highScore, comboLevel, status, muted } = get();

    if (status === 'gameover') return;

    const piece = tray[trayIndex];
    if (piece == null) return;
    if (!isValidPlacement(board, piece, row, col)) return;

    // Place piece
    const boardAfterPlace = applyPlacement(board, piece, row, col);
    const placementPts = computePlacementPoints(piece);

    // Detect and clear lines
    const lines = findClearedLines(boardAfterPlace);
    const linesCleared = lines.rows.length + lines.cols.length;
    const clearPts = computeClearPoints(linesCleared, comboLevel);
    const newComboLevel = linesCleared > 0 ? comboLevel + 1 : 1;
    const finalBoard = linesCleared > 0 ? clearLines(boardAfterPlace, lines) : boardAfterPlace;
    const clearingCells = linesCleared > 0
      ? buildClearingSet(lines.rows, lines.cols)
      : new Set<string>();

    // Update score
    const newScore = score + placementPts + clearPts;

    // Null out tray slot; regenerate when all three are spent
    const nextTray: (Piece | null)[] = tray.map((p, i) => (i === trayIndex ? null : p));
    const finalTray: (Piece | null)[] = nextTray.every(p => p === null)
      ? generateTray()
      : nextTray;

    // Game-over check
    const newStatus = hasAnyValidMove(finalBoard, finalTray) ? 'playing' : 'gameover';

    // Persist high score if beaten
    const newHighScore = newScore > highScore ? newScore : highScore;
    if (newScore > highScore) {
      try {
        localStorage.setItem(HS_KEY, String(newScore));
      } catch {
        // localStorage unavailable — best-effort
      }
    }

    set({
      board: finalBoard,
      tray: finalTray,
      score: newScore,
      highScore: newHighScore,
      comboLevel: newComboLevel,
      status: newStatus,
      clearing: clearingCells,
    });

    // Sound effects — fired after state is committed
    playPlace(muted);
    if (linesCleared > 0) {
      // Pass pre-increment comboLevel: level ≥ 2 means this is a consecutive clear chain
      playClear(linesCleared, muted, comboLevel);
    }
    if (newStatus === 'gameover') {
      // Delay so the clear arpeggio (up to 300ms) finishes first
      const delay = linesCleared > 0 ? 400 : 100;
      setTimeout(() => playGameOver(get().muted), delay);
    }

    // Clear the flash after CLEAR_FLASH_MS
    if (linesCleared > 0) {
      setTimeout(() => set({ clearing: new Set<string>() }), CLEAR_FLASH_MS);
    }
  },

  reset() {
    set({
      board: createEmptyBoard(),
      tray: generateTray(),
      score: 0,
      comboLevel: 1,
      status: 'playing',
      highScore: get().highScore, // preserved
      clearing: new Set<string>(),
    });
  },

  toggleMute() {
    const newMuted = !get().muted;
    try {
      localStorage.setItem(MUTE_KEY, String(newMuted));
    } catch {
      // best-effort
    }
    set({ muted: newMuted });
  },
}));
