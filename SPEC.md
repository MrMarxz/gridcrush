# SPEC.md — GridCrush

The source of truth for game behavior. If code disagrees with this, the code is wrong.

---

## 1. Game overview

A turn-based, single-player puzzle. The player is given an 8×8 board and a tray of three randomly-generated polyomino pieces. They drag pieces onto the board. Filled rows and columns clear. The game ends when no piece in the tray can be placed anywhere.

There is **no gravity, no rotation, no time pressure.** Pieces stay where they're placed until cleared by completing a line.

---

## 2. Board

- **Size:** 8 columns × 8 rows.
- **Coordinate system:** `(row, col)` where `row` is 0 at the top, `col` is 0 at the left.
- **Cell state:** each cell is either empty or filled. Filled cells carry a colour (the colour of the piece that placed them, kept for visual consistency until cleared).
- **Initial state:** all cells empty.

```ts
type Cell = { filled: false } | { filled: true; color: PieceColor };
type Board = Cell[][]; // board[row][col]; always 8×8
```

---

## 3. Pieces

### 3.1 Piece shape definition

A piece is a set of `(row, col)` offsets relative to its top-left bounding box. Always normalised so the minimum row and column offset is 0.

```ts
type Offset = { row: number; col: number };
type PieceShape = Offset[]; // sorted, deduplicated, normalised to (0,0) origin
type PieceColor = "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink";
type Piece = { id: string; shape: PieceShape; color: PieceColor };
```

### 3.2 Required piece set

The generator must draw from this set. These are the pieces in v1 — do not add or remove without updating this spec.

| Name              | Cells | Offsets                                                       |
| ----------------- | ----- | ------------------------------------------------------------- |
| Single            | 1     | (0,0)                                                         |
| Domino-H          | 2     | (0,0)(0,1)                                                    |
| Domino-V          | 2     | (0,0)(1,0)                                                    |
| Tromino-H         | 3     | (0,0)(0,1)(0,2)                                               |
| Tromino-V         | 3     | (0,0)(1,0)(2,0)                                               |
| L-3 (each rotation as separate entry) | 3 | 4 rotations of the L-tromino                       |
| Square-2          | 4     | (0,0)(0,1)(1,0)(1,1)                                          |
| Tetromino-line-H  | 4     | (0,0)(0,1)(0,2)(0,3)                                          |
| Tetromino-line-V  | 4     | (0,0)(1,0)(2,0)(3,0)                                          |
| L-4 (4 rotations) | 4     | each rotation a separate entry                                |
| J-4 (4 rotations) | 4     | each rotation a separate entry                                |
| T-4 (4 rotations) | 4     | each rotation a separate entry                                |
| S-4 / Z-4         | 4     | both, each in 2 rotations                                     |
| Line-5-H          | 5     | (0,0)(0,1)(0,2)(0,3)(0,4)                                     |
| Line-5-V          | 5     | (0,0)(1,0)(2,0)(3,0)(4,0)                                     |
| Square-3          | 9     | full 3×3 block                                                |

**No rotation in-game.** Each rotation is a distinct piece in the generator pool.

The exact offset arrays for each rotation must be defined explicitly as constants in `src/game/pieces.ts`. Do not generate rotations at runtime — write them out so they're visible and reviewable.

### 3.3 Piece generation

- The tray holds **3 pieces**. When all three are placed, a new set of 3 is generated.
- Each piece is drawn **uniformly at random** from the piece set above.
- The RNG must be **injectable** (pass a `() => number` into the generator function). This makes the logic testable. The default app instantiates one with `Math.random`; tests use a seeded RNG.
- Pieces in the tray do **not** automatically replace as you place them — all three must be used before the next set arrives. This is important: it's a deliberate strategic constraint of the genre.

> **Known footgun:** uniform random generation can produce unwinnable hands (e.g. three 3×3 squares on a near-full board). For v1, accept this — it's part of the genre. Do not try to "smart" the generator to avoid losses. Document this trade-off in code comments.

---

## 4. Placement

### 4.1 Validity

A piece at proposed position `(targetRow, targetCol)` is valid if and only if **every** offset `(dr, dc)` in the piece satisfies:

1. `0 ≤ targetRow + dr < 8`
2. `0 ≤ targetCol + dc < 8`
3. `board[targetRow + dr][targetCol + dc].filled === false`

### 4.2 Placement action

When the player drops a valid piece:

1. Mark each `board[targetRow + dr][targetCol + dc]` as filled with the piece's colour.
2. Award placement points (see §5).
3. Run line-clear detection (§4.3).
4. Remove the piece from the tray.
5. If the tray is now empty, generate a new tray of 3 pieces.
6. Run game-over detection (§4.4).

### 4.3 Line clearing

After a placement:

1. Identify **all** rows where every cell is filled.
2. Identify **all** columns where every cell is filled.
3. **Compute the union** of cells to clear (a cell at the intersection of a cleared row and cleared column is only counted once visually, but **scoring counts the row and column separately** — see §5).
4. Clear all those cells in a single atomic update.

> **Critical:** detect rows and columns from the board state *after the piece has been placed but before any clearing*. Do not clear iteratively — a single placement that completes a row and a column should clear both at once, not in sequence.

There is **no chain reaction in this genre**. Cleared cells do not cause further clears. If you're tempted to add cascade logic, don't.

### 4.4 Game over

After every placement (and after any resulting line clears), check: is there at least one piece in the tray that has at least one valid position on the board?

- If yes: continue.
- If no: game over. Show the game-over screen with the final score and a "Play Again" button.

> **Algorithm:** for each piece still in the tray, iterate every `(row, col)` from `(0,0)` to `(7,7)` and check validity (§4.1). If any piece has any valid position, the game continues. This is O(pieces × 64 × maxOffsets), trivially fast.

---

## 5. Scoring

All scoring is integer.

| Event                         | Points                                  |
| ----------------------------- | --------------------------------------- |
| Place a piece                 | +1 per cell in the piece                |
| Clear 1 line                  | +10                                     |
| Clear 2 lines in one move     | +30   (10 + 20 bonus)                   |
| Clear 3 lines in one move     | +60   (10 + 20 + 30 bonus)              |
| Clear 4 lines in one move     | +100  (10 + 20 + 30 + 40 bonus)         |
| Clear N lines in one move     | `10·N + 10·(N·(N−1)/2)` general formula |
| Combo: clear lines on consecutive placements | multiply the placement's clear points by `comboLevel` (starts at 2 on the second consecutive clearing placement, +1 each additional consecutive placement that clears, resets to 1 the moment a placement clears nothing) |

A "line" = one full row OR one full column. A placement that fills both a row and a column simultaneously counts as **2 lines cleared** for scoring.

### 5.1 High score

- Persist the highest score ever achieved, in `localStorage` under the key `gridcrush:highscore:v1`.
- Display the current score and high score above the board at all times.
- On game over, if the final score beats the high score, show "New best!" on the game-over screen.

---

## 6. Visual & audio behaviour

### 6.1 Visuals

- Board: 8×8 grid of cells, each cell ~48px on desktop. Light, neutral background. Empty cells have a faint border.
- Filled cells use the piece's colour with a slight inset shadow to feel "blocky".
- Tray: row of three pieces below the board. Each piece is rendered at the same cell size as the board.
- **Drag preview:** while dragging, show a translucent ghost of the piece snapped to the grid cell under the pointer. If the position is invalid, tint the ghost red. If valid, tint it the piece's colour at ~50% opacity.
- **On line clear:** the cells about to be cleared flash white for ~200ms, then disappear. No fancy particles. No bouncing. Keep it tight.
- **On game over:** dim the board, overlay a card showing final score, high score, and a "Play Again" button.

### 6.2 Audio

All sounds are generated procedurally with the **Web Audio API** — no audio files. Implement a small `playTone(frequency, duration, type)` helper.

| Event             | Sound                                                     |
| ----------------- | --------------------------------------------------------- |
| Place a piece     | Short 80ms 440Hz sine tone                                |
| Clear 1 line      | 150ms 660Hz triangle                                      |
| Clear 2+ lines    | Ascending 3-note arpeggio (660 → 880 → 1100Hz, 100ms each)|
| Combo (level ≥ 2) | Add a higher harmonic on top of the clear sound          |
| Game over         | Descending 3-note minor arpeggio (440 → 370 → 294Hz, 200ms each) |
| Invalid placement | (no sound — the visual red tint is enough)               |

Audio must respect a mute toggle (a small icon in the corner). Mute state persists in `localStorage` under `gridcrush:muted:v1`.

> **Browser quirk:** the Web Audio context can only start after a user gesture. Initialise it lazily on the first click anywhere in the app, not on page load.

---

## 7. Required tests

These tests must exist and pass before the project is considered complete. Co-locate in `src/game/*.test.ts`.

### `pieces.test.ts`
- Every piece shape is normalised (min row offset = 0, min col offset = 0).
- No piece has duplicate offsets.
- Every piece fits inside an 8×8 board (no offset ≥ 8).
- The piece pool contains the expected count of distinct pieces.

### `placement.test.ts`
- A piece placed within bounds on empty cells is valid.
- A piece overlapping a filled cell is invalid.
- A piece extending past row 7 or column 7 is invalid.
- A piece extending into negative coordinates is invalid (shouldn't happen via UI but logic must reject).
- Placing a piece returns a new board with exactly the piece's cells filled with the piece's colour.

### `clearing.test.ts`
- A board with one full row and no full columns clears that row only.
- A board with one full column and no full rows clears that column only.
- A board where a placement completes a row AND a column clears both, with the intersection cell only "removed" once but counted as 2 lines for scoring.
- A board with two full rows clears both atomically.
- Cleared cells become empty.
- Non-cleared cells are untouched (including their colour).

### `scoring.test.ts`
- Placing an N-cell piece awards N placement points.
- Clearing 1 line awards 10 points; 2 → 30; 3 → 60; 4 → 100.
- Combo level resets to 1 after a placement that clears no lines.
- Combo level increments correctly across consecutive clearing placements.
- High score updates only when the final score exceeds the previous high.

### `gameover.test.ts`
- An empty board with any non-empty tray is not game over.
- A fully filled board with any non-empty tray is game over.
- A board with one valid spot for one piece in the tray is **not** game over (even if the other two pieces don't fit).
- Game over fires the moment no piece in the tray fits anywhere.

---

## 8. State shape (Zustand store)

```ts
type GameState = {
  board: Board;             // 8×8
  tray: (Piece | null)[];   // length 3; null = already placed this round
  score: number;
  highScore: number;
  comboLevel: number;       // resets to 1 on non-clearing placement
  status: "playing" | "gameover";
  muted: boolean;

  // Actions
  placePiece: (trayIndex: number, row: number, col: number) => void;
  reset: () => void;
  toggleMute: () => void;
};
```

The store uses the pure functions in `src/game/` to compute new states. The store itself is the only place that calls `Math.random` (for piece generation) and `localStorage` (for high score / mute).

---

## 9. File layout (target)

```
src/
  game/
    types.ts          // Cell, Board, Piece, etc.
    pieces.ts         // PIECE_POOL constant
    pieces.test.ts
    placement.ts      // isValidPlacement, placePiece
    placement.test.ts
    clearing.ts       // findClearedLines, clearLines
    clearing.test.ts
    scoring.ts        // computePlacementScore, computeClearScore
    scoring.test.ts
    gameover.ts       // hasAnyValidMove
    gameover.test.ts
    rng.ts            // seedable RNG for tests; Math.random wrapper for app
  store/
    game-store.ts     // Zustand store
  components/
    Board.tsx
    Cell.tsx
    Tray.tsx
    PieceView.tsx
    DragLayer.tsx     // dnd-kit DragOverlay
    Hud.tsx           // score, high score, mute toggle
    GameOverModal.tsx
    App.tsx
  audio/
    sounds.ts         // playTone, playPlace, playClear, playCombo, playGameOver
  main.tsx
  index.css           // Tailwind directives only
```

---

## 10. Non-goals (repeated for emphasis)

- No mobile.
- No piece rotation.
- No backend, accounts, leaderboards.
- No "smart" piece generation.
- No animations beyond the clear-flash and a minimal drag ghost.
- No themes or settings beyond mute.

If a future task suggests any of these, push back and re-read this section.
