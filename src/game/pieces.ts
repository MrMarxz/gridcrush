import type { Piece, PieceColor, PieceShape } from './types';
import type { RNG } from './rng';

// 1-cell
const SINGLE: PieceShape = [{ row: 0, col: 0 }];

// 2-cell
const DOMINO_H: PieceShape = [{ row: 0, col: 0 }, { row: 0, col: 1 }];
const DOMINO_V: PieceShape = [{ row: 0, col: 0 }, { row: 1, col: 0 }];

// 3-cell straight
const TROMINO_H: PieceShape = [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }];
const TROMINO_V: PieceShape = [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }];

// L-3 (4 rotations) — offsets confirmed in SPEC §3.2
// L-3-a: X .   L-3-b: X X   L-3-c: X X   L-3-d: . X
//         X X           . X           X .           X X
const L3_A: PieceShape = [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 1, col: 1 }];
const L3_B: PieceShape = [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 1 }];
const L3_C: PieceShape = [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 0 }];
const L3_D: PieceShape = [{ row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 }];

// 4-cell square (2×2)
const SQUARE_2: PieceShape = [
  { row: 0, col: 0 }, { row: 0, col: 1 },
  { row: 1, col: 0 }, { row: 1, col: 1 },
];

// 4-cell straight
const TETROMINO_LINE_H: PieceShape = [
  { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 },
];
const TETROMINO_LINE_V: PieceShape = [
  { row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }, { row: 3, col: 0 },
];

// L-4 (4 rotations)
// L-4-0: X .   L-4-1: X X X   L-4-2: X X   L-4-3: . . X
//         X .            X . .           . X            X X X
//         X X
const L4_0: PieceShape = [
  { row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }, { row: 2, col: 1 },
];
const L4_1: PieceShape = [
  { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 1, col: 0 },
];
const L4_2: PieceShape = [
  { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 1 }, { row: 2, col: 1 },
];
const L4_3: PieceShape = [
  { row: 0, col: 2 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 },
];

// J-4 (4 rotations)
// J-4-0: . X   J-4-1: X . .   J-4-2: X X   J-4-3: X X X
//         . X            X X X           X .            . . X
//         X X
const J4_0: PieceShape = [
  { row: 0, col: 1 }, { row: 1, col: 1 }, { row: 2, col: 0 }, { row: 2, col: 1 },
];
const J4_1: PieceShape = [
  { row: 0, col: 0 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 },
];
const J4_2: PieceShape = [
  { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 0 }, { row: 2, col: 0 },
];
const J4_3: PieceShape = [
  { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 1, col: 2 },
];

// T-4 (4 rotations)
// T-4-0: X X X   T-4-1: . X   T-4-2: . X .   T-4-3: X .
//         . X .            X X            X X X            X X
//                          . X                             X .
const T4_0: PieceShape = [
  { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 1, col: 1 },
];
const T4_1: PieceShape = [
  { row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 1 },
];
const T4_2: PieceShape = [
  { row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 },
];
const T4_3: PieceShape = [
  { row: 0, col: 0 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 0 },
];

// S-4 (2 rotations)
// S-4-0: . X X   S-4-1: X .
//         X X .            X X
//                          . X
const S4_0: PieceShape = [
  { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 1, col: 0 }, { row: 1, col: 1 },
];
const S4_1: PieceShape = [
  { row: 0, col: 0 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 1 },
];

// Z-4 (2 rotations)
// Z-4-0: X X .   Z-4-1: . X
//         . X X            X X
//                          X .
const Z4_0: PieceShape = [
  { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 1 }, { row: 1, col: 2 },
];
const Z4_1: PieceShape = [
  { row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 0 },
];

// 5-cell straight
const LINE_5_H: PieceShape = [
  { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 },
  { row: 0, col: 3 }, { row: 0, col: 4 },
];
const LINE_5_V: PieceShape = [
  { row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 },
  { row: 3, col: 0 }, { row: 4, col: 0 },
];

// 3×3 square (9 cells)
const SQUARE_3: PieceShape = [
  { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 },
  { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 },
  { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 },
];

// 31 entries total — update this comment if the pool ever changes
export const PIECE_POOL: readonly PieceShape[] = [
  SINGLE,
  DOMINO_H, DOMINO_V,
  TROMINO_H, TROMINO_V,
  L3_A, L3_B, L3_C, L3_D,
  SQUARE_2,
  TETROMINO_LINE_H, TETROMINO_LINE_V,
  L4_0, L4_1, L4_2, L4_3,
  J4_0, J4_1, J4_2, J4_3,
  T4_0, T4_1, T4_2, T4_3,
  S4_0, S4_1,
  Z4_0, Z4_1,
  LINE_5_H, LINE_5_V,
  SQUARE_3,
];

const COLORS: readonly PieceColor[] = [
  'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink',
];

// Uniform random generation can produce unwinnable hands (e.g. three 3×3 squares on a
// near-full board). This is intentional for v1 — see SPEC §3.3.
export function randomPiece(rng: RNG): Piece {
  const shape = PIECE_POOL[Math.floor(rng() * PIECE_POOL.length)]!;
  const color = COLORS[Math.floor(rng() * COLORS.length)]!;
  return { id: crypto.randomUUID(), shape, color };
}
