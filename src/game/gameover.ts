import type { Board, Piece } from './types';
import { isValidPlacement } from './placement';

const BOARD_SIZE = 8;

export function hasAnyValidMove(board: Board, tray: (Piece | null)[]): boolean {
  for (const piece of tray) {
    if (piece === null) continue;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (isValidPlacement(board, piece, r, c)) return true;
      }
    }
  }
  return false;
}
