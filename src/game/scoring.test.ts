import { describe, it, expect } from 'vitest';
import { computePlacementPoints, computeClearPoints } from './scoring';
import type { Piece } from './types';

function makePiece(cellCount: number): Piece {
  return {
    id: 'test',
    shape: Array.from({ length: cellCount }, (_, i) => ({ row: 0, col: i })),
    color: 'red',
  };
}

describe('computePlacementPoints', () => {
  it('awards 1 point per cell in the piece', () => {
    expect(computePlacementPoints(makePiece(1))).toBe(1);
    expect(computePlacementPoints(makePiece(2))).toBe(2);
    expect(computePlacementPoints(makePiece(4))).toBe(4);
    expect(computePlacementPoints(makePiece(9))).toBe(9);
  });
});

describe('computeClearPoints', () => {
  it('returns 0 when no lines are cleared', () => {
    expect(computeClearPoints(0, 1)).toBe(0);
    expect(computeClearPoints(0, 5)).toBe(0);
  });

  it('awards 10 for 1 line at combo level 1', () => {
    expect(computeClearPoints(1, 1)).toBe(10);
  });

  it('awards 30 for 2 lines at combo level 1', () => {
    expect(computeClearPoints(2, 1)).toBe(30);
  });

  it('awards 60 for 3 lines at combo level 1', () => {
    expect(computeClearPoints(3, 1)).toBe(60);
  });

  it('awards 100 for 4 lines at combo level 1', () => {
    expect(computeClearPoints(4, 1)).toBe(100);
  });

  it('awards 150 for 5 lines at combo level 1', () => {
    // 10·5 + 10·(5·4/2) = 50 + 100 = 150
    expect(computeClearPoints(5, 1)).toBe(150);
  });

  // Combo: comboLevel starts at 1, multiplies clear points only (not placement points).
  // First clear in chain: ×1 (no bonus). Second consecutive: ×2. Third: ×3.
  it('combo level 1 applies no multiplier (base points only)', () => {
    expect(computeClearPoints(1, 1)).toBe(10);
  });

  it('combo level 2 doubles the clear points', () => {
    expect(computeClearPoints(1, 2)).toBe(20);
    expect(computeClearPoints(2, 2)).toBe(60);
  });

  it('combo level 3 triples the clear points', () => {
    expect(computeClearPoints(1, 3)).toBe(30);
    expect(computeClearPoints(3, 3)).toBe(180);
  });

  it('resets correctly — level 1 after a non-clearing move produces base points again', () => {
    // Simulate: clear (level 1) → no clear (reset to 1) → clear (level 1 again)
    expect(computeClearPoints(1, 1)).toBe(10); // first clear
    // (store would reset comboLevel to 1 on the no-clear move)
    expect(computeClearPoints(1, 1)).toBe(10); // back to base
  });
});
