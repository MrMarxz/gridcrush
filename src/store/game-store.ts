import { create } from 'zustand';
import { createEmptyBoard } from '../game/types';
import type { Board, Piece } from '../game/types';
import { isValidPlacement, placePiece as applyPlacement } from '../game/placement';
import { findClearedLines, clearLines } from '../game/clearing';
import { computePlacementPoints, computeClearPoints } from '../game/scoring';
import { hasAnyValidMove } from '../game/gameover';
import { randomPiece } from '../game/pieces';
import { mathRandom } from '../game/rng';

const HS_KEY = 'gridcrush:highscore:v1';
const MUTE_KEY = 'gridcrush:muted:v1';

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

export type GameState = {
  board: Board;
  tray: (Piece | null)[];
  score: number;
  highScore: number;
  comboLevel: number;
  status: 'playing' | 'gameover';
  muted: boolean;

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

  placePiece(trayIndex, row, col) {
    const { board, tray, score, highScore, comboLevel, status } = get();

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
    });
  },

  reset() {
    set({
      board: createEmptyBoard(),
      tray: generateTray(),
      score: 0,
      comboLevel: 1,
      status: 'playing',
      highScore: get().highScore, // preserved
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
