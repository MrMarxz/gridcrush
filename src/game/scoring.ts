import type { Piece } from './types';

// Combo clarification (SPEC §5, resolved in design discussion):
// comboLevel starts at 1. A clearing placement multiplies its clear points by comboLevel,
// then the store increments comboLevel. A non-clearing placement resets comboLevel to 1.
// Placement points are never multiplied. Level 1 = base points, no bonus.

export function computePlacementPoints(piece: Piece): number {
  return piece.shape.length;
}

export function computeClearPoints(linesCleared: number, comboLevel: number): number {
  if (linesCleared === 0) return 0;
  // Base formula: 10·N + 10·(N·(N−1)/2)  — see SPEC §5
  const base = 10 * linesCleared + 10 * ((linesCleared * (linesCleared - 1)) / 2);
  return base * comboLevel;
}
