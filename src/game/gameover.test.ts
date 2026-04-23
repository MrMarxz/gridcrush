import { describe, it, expect } from 'vitest';
import { hasAnyValidMove } from './gameover';
import { createEmptyBoard } from './types';
import { placePiece } from './placement';
import type { Board, Piece } from './types';

const SINGLE: Piece = { id: 'single', shape: [{ row: 0, col: 0 }], color: 'red' };
const DOMINO_H: Piece = { id: 'domino', shape: [{ row: 0, col: 0 }, { row: 0, col: 1 }], color: 'blue' };

function fillBoard(board: Board): Board {
  let b = board;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      b = placePiece(b, SINGLE, r, c);
    }
  }
  return b;
}

describe('hasAnyValidMove', () => {
  it('empty board with any non-empty tray is not game over', () => {
    const board = createEmptyBoard();
    expect(hasAnyValidMove(board, [SINGLE, null, null])).toBe(true);
    expect(hasAnyValidMove(board, [null, DOMINO_H, null])).toBe(true);
  });

  it('fully filled board with any non-empty tray is game over', () => {
    const board = fillBoard(createEmptyBoard());
    expect(hasAnyValidMove(board, [SINGLE, null, null])).toBe(false);
    expect(hasAnyValidMove(board, [SINGLE, DOMINO_H, null])).toBe(false);
  });

  it('a board with one valid spot for one piece is NOT game over', () => {
    // Fill every cell except (7,7)
    let board = createEmptyBoard();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (r === 7 && c === 7) continue;
        board = placePiece(board, SINGLE, r, c);
      }
    }
    // SINGLE fits at (7,7); DOMINO_H doesn't fit anywhere
    expect(hasAnyValidMove(board, [SINGLE, DOMINO_H, null])).toBe(true);
  });

  it('game over fires when no piece in the tray can fit anywhere', () => {
    // Only one empty cell remains at (7,7) — DOMINO_H requires two adjacent cells
    let board = createEmptyBoard();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (r === 7 && c === 7) continue;
        board = placePiece(board, SINGLE, r, c);
      }
    }
    expect(hasAnyValidMove(board, [null, DOMINO_H, null])).toBe(false);
  });

  it('null tray slots are skipped and not counted as valid', () => {
    const board = fillBoard(createEmptyBoard());
    expect(hasAnyValidMove(board, [null, null, null])).toBe(false);
  });

  it('a fully empty tray (all null) on an empty board is game over', () => {
    expect(hasAnyValidMove(createEmptyBoard(), [null, null, null])).toBe(false);
  });
});
