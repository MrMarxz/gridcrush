import { describe, it, expect } from 'vitest';
import { findClearedLines, clearLines } from './clearing';
import { createEmptyBoard } from './types';
import { placePiece } from './placement';
import type { Board, Piece } from './types';

function cell(color: Piece['color']): { filled: true; color: Piece['color'] } {
  return { filled: true, color };
}

function fillRow(board: Board, row: number, color: Piece['color'] = 'red'): Board {
  let b = board;
  for (let c = 0; c < 8; c++) {
    b = placePiece(b, { id: `r${row}c${c}`, shape: [{ row: 0, col: 0 }], color }, row, c);
  }
  return b;
}

function fillCol(board: Board, col: number, color: Piece['color'] = 'blue'): Board {
  let b = board;
  for (let r = 0; r < 8; r++) {
    b = placePiece(b, { id: `r${r}c${col}`, shape: [{ row: 0, col: 0 }], color }, r, col);
  }
  return b;
}

describe('findClearedLines', () => {
  it('finds one full row and no columns', () => {
    const board = fillRow(createEmptyBoard(), 3);
    const { rows, cols } = findClearedLines(board);
    expect(rows).toEqual([3]);
    expect(cols).toEqual([]);
  });

  it('finds one full column and no rows', () => {
    const board = fillCol(createEmptyBoard(), 5);
    const { rows, cols } = findClearedLines(board);
    expect(rows).toEqual([]);
    expect(cols).toEqual([5]);
  });

  it('finds both a completed row and a completed column', () => {
    const board = fillCol(fillRow(createEmptyBoard(), 2), 4);
    const { rows, cols } = findClearedLines(board);
    expect(rows).toContain(2);
    expect(cols).toContain(4);
  });

  it('finds two full rows atomically', () => {
    const board = fillRow(fillRow(createEmptyBoard(), 0), 7);
    const { rows, cols } = findClearedLines(board);
    expect(rows).toEqual([0, 7]);
    expect(cols).toEqual([]);
  });

  it('returns empty arrays for a board with no full lines', () => {
    const board = placePiece(createEmptyBoard(), { id: 'x', shape: [{ row: 0, col: 0 }], color: 'red' }, 0, 0);
    const { rows, cols } = findClearedLines(board);
    expect(rows).toEqual([]);
    expect(cols).toEqual([]);
  });
});

describe('clearLines', () => {
  it('clears a full row; non-cleared cells are untouched', () => {
    let board = fillRow(createEmptyBoard(), 4);
    board = placePiece(board, { id: 'extra', shape: [{ row: 0, col: 0 }], color: 'green' }, 1, 1);

    const result = clearLines(board, findClearedLines(board));

    for (let c = 0; c < 8; c++) {
      expect(result[4]?.[c]).toEqual({ filled: false });
    }
    expect(result[1]?.[1]).toEqual(cell('green'));
  });

  it('clears a full column; non-cleared cells are untouched', () => {
    let board = fillCol(createEmptyBoard(), 2);
    board = placePiece(board, { id: 'extra', shape: [{ row: 0, col: 0 }], color: 'purple' }, 3, 5);

    const result = clearLines(board, findClearedLines(board));

    for (let r = 0; r < 8; r++) {
      expect(result[r]?.[2]).toEqual({ filled: false });
    }
    expect(result[3]?.[5]).toEqual(cell('purple'));
  });

  it('clears a row AND column simultaneously; intersection cell cleared once', () => {
    // Fill row 1 (red) then col 3 (blue) — intersection cell (1,3) gets overwritten to blue,
    // but both lines are still detected and cleared in one atomic pass.
    const board = fillCol(fillRow(createEmptyBoard(), 1), 3);
    const lines = findClearedLines(board);

    expect(lines.rows).toContain(1);
    expect(lines.cols).toContain(3);

    const result = clearLines(board, lines);

    for (let c = 0; c < 8; c++) {
      expect(result[1]?.[c]).toEqual({ filled: false });
    }
    for (let r = 0; r < 8; r++) {
      expect(result[r]?.[3]).toEqual({ filled: false });
    }
  });

  it('clears two full rows atomically', () => {
    const board = fillRow(fillRow(createEmptyBoard(), 0), 7);
    const result = clearLines(board, findClearedLines(board));

    for (let c = 0; c < 8; c++) {
      expect(result[0]?.[c]).toEqual({ filled: false });
      expect(result[7]?.[c]).toEqual({ filled: false });
    }
    // Rows in between are untouched (still empty)
    expect(result[3]?.[3]).toEqual({ filled: false });
  });

  it('cleared cells become empty regardless of original colour', () => {
    const board = fillRow(createEmptyBoard(), 0, 'orange');
    const result = clearLines(board, findClearedLines(board));
    for (let c = 0; c < 8; c++) {
      expect(result[0]?.[c]).toEqual({ filled: false });
    }
  });

  it('non-cleared filled cells retain their original colour', () => {
    let board = fillRow(createEmptyBoard(), 6);
    board = placePiece(board, { id: 'p', shape: [{ row: 0, col: 0 }], color: 'orange' }, 3, 3);
    const result = clearLines(board, findClearedLines(board));
    expect(result[3]?.[3]).toEqual(cell('orange'));
  });
});
