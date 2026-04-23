import { describe, it, expect } from 'vitest';
import { isValidPlacement, placePiece } from './placement';
import { createEmptyBoard } from './types';
import type { Piece } from './types';

function makePiece(offsets: { row: number; col: number }[], color: Piece['color'] = 'red'): Piece {
  return { id: 'test', shape: offsets, color };
}

const SINGLE = makePiece([{ row: 0, col: 0 }]);
const DOMINO_H = makePiece([{ row: 0, col: 0 }, { row: 0, col: 1 }]);
const DOMINO_V = makePiece([{ row: 0, col: 0 }, { row: 1, col: 0 }]);

describe('isValidPlacement', () => {
  it('is valid for a piece within bounds on empty cells', () => {
    const board = createEmptyBoard();
    expect(isValidPlacement(board, DOMINO_H, 0, 0)).toBe(true);
    expect(isValidPlacement(board, SINGLE, 7, 7)).toBe(true);
  });

  it('is invalid when overlapping a filled cell', () => {
    const board = placePiece(createEmptyBoard(), SINGLE, 3, 3);
    expect(isValidPlacement(board, SINGLE, 3, 3)).toBe(false);
    expect(isValidPlacement(board, DOMINO_H, 3, 2)).toBe(false);
  });

  it('is invalid when a cell extends past row 7', () => {
    const board = createEmptyBoard();
    expect(isValidPlacement(board, DOMINO_V, 7, 0)).toBe(false);
  });

  it('is invalid when a cell extends past col 7', () => {
    const board = createEmptyBoard();
    expect(isValidPlacement(board, DOMINO_H, 0, 7)).toBe(false);
  });

  it('is invalid for negative row coordinates', () => {
    const board = createEmptyBoard();
    expect(isValidPlacement(board, SINGLE, -1, 0)).toBe(false);
  });

  it('is invalid for negative col coordinates', () => {
    const board = createEmptyBoard();
    expect(isValidPlacement(board, SINGLE, 0, -1)).toBe(false);
  });
});

describe('placePiece', () => {
  it('returns a new board with exactly the piece cells filled in the piece colour', () => {
    const board = createEmptyBoard();
    const piece = makePiece([{ row: 0, col: 0 }, { row: 0, col: 1 }], 'blue');
    const result = placePiece(board, piece, 2, 3);

    expect(result[2]?.[3]).toEqual({ filled: true, color: 'blue' });
    expect(result[2]?.[4]).toEqual({ filled: true, color: 'blue' });
    // Adjacent cell not in the piece should remain empty
    expect(result[2]?.[2]).toEqual({ filled: false });
    expect(result[3]?.[3]).toEqual({ filled: false });
  });

  it('does not mutate the original board', () => {
    const board = createEmptyBoard();
    placePiece(board, SINGLE, 0, 0);
    expect(board[0]?.[0]).toEqual({ filled: false });
  });

  it('places a multi-cell piece with correct relative offsets', () => {
    const board = createEmptyBoard();
    const lShape = makePiece([{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 1, col: 1 }], 'green');
    const result = placePiece(board, lShape, 4, 4);

    expect(result[4]?.[4]).toEqual({ filled: true, color: 'green' });
    expect(result[5]?.[4]).toEqual({ filled: true, color: 'green' });
    expect(result[5]?.[5]).toEqual({ filled: true, color: 'green' });
    expect(result[4]?.[5]).toEqual({ filled: false });
  });
});
