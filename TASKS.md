# TASKS.md — GridCrush build order

Work top-to-bottom. **Stop at the end of each phase** and report back before starting the next. Tick boxes as you go.

---

## Phase 0 — Project setup

- [x] Initialise Vite project: `pnpm create vite . --template react-ts`
- [x] Install runtime deps: `pnpm add @dnd-kit/core zustand`
- [x] Install dev deps: `pnpm add -D tailwindcss postcss autoprefixer vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @types/node`
- [x] Initialise Tailwind: `pnpm tailwindcss init -p`. Configure `tailwind.config.js` to scan `./index.html` and `./src/**/*.{ts,tsx}`. Add the three `@tailwind` directives to `src/index.css`.
- [x] Configure Vitest in `vite.config.ts` (`test: { environment: 'jsdom', globals: true, setupFiles: './src/test-setup.ts' }`). Create `src/test-setup.ts` importing `@testing-library/jest-dom`.
- [x] Add scripts to `package.json`: `"typecheck": "tsc --noEmit"`, `"test": "vitest run"`, `"test:watch": "vitest"`.
- [x] Confirm `tsconfig.json` has `"strict": true`, `"noUncheckedIndexedAccess": true`. Add the latter if missing — it catches half the bugs you'd otherwise hit indexing into the board.
- [x] Delete the Vite boilerplate (`App.css`, the React/Vite logos, the counter demo). Replace `App.tsx` with a placeholder `<div>GridCrush</div>`.
- [x] Sanity check: `pnpm dev` shows the placeholder; `pnpm typecheck` passes; `pnpm test` passes (no tests yet, that's fine).

**STOP. Report what's installed and confirm everything builds before continuing.**

---

## Phase 1 — Pure game logic (no UI)

Build all of `src/game/` as pure, tested functions. **No React in this phase.**

- [x] `src/game/types.ts` — define `Cell`, `Board`, `PieceColor`, `Offset`, `PieceShape`, `Piece`. Match SPEC §2 and §3.1 exactly.
- [x] `src/game/rng.ts` — a `RNG = () => number` type and a `mulberry32(seed: number): RNG` seeded RNG for tests. Export a default `mathRandom: RNG` that just wraps `Math.random`.
- [x] `src/game/pieces.ts` — define `PIECE_POOL: PieceShape[]` with every piece from SPEC §3.2 written out by hand. Export a `randomPiece(rng: RNG): Piece` that picks a uniform random shape and assigns a uniform random colour and a fresh `id` (use `crypto.randomUUID()`).
- [x] `src/game/pieces.test.ts` — write all tests from SPEC §7 for pieces. Include a test that uses a seeded RNG to confirm `randomPiece` is deterministic.
- [x] `src/game/placement.ts` — `isValidPlacement(board, piece, row, col): boolean` and `placePiece(board, piece, row, col): Board` (returns a new board, never mutates).
- [x] `src/game/placement.test.ts` — every test from SPEC §7.
- [x] `src/game/clearing.ts` — `findClearedLines(board): { rows: number[], cols: number[] }` and `clearLines(board, lines): Board`.
- [x] `src/game/clearing.test.ts` — every test from SPEC §7. Pay special attention to the "row + column simultaneously" case — it's the most common bug.
- [x] `src/game/scoring.ts` — `computePlacementPoints(piece): number`, `computeClearPoints(linesCleared: number, comboLevel: number): number`. Pure, no state.
- [x] `src/game/scoring.test.ts` — every test from SPEC §7. Verify the bonus formula with N=1,2,3,4,5.
- [x] `src/game/gameover.ts` — `hasAnyValidMove(board, tray: (Piece | null)[]): boolean`.
- [x] `src/game/gameover.test.ts` — every test from SPEC §7. The "one valid spot for one piece" test is the critical one.
- [x] Run `pnpm test`. **All tests must pass.** Run `pnpm typecheck`. **Must pass clean.**

**STOP. Report test count, pass/fail, and any spec ambiguities encountered. Wait for the user before continuing.**

---

## Phase 2 — State store

- [x] `src/store/game-store.ts` — Zustand store matching SPEC §8. Wire up:
  - `placePiece(trayIndex, row, col)`: validate → place → score placement → find lines → score clears → update combo → clear lines → null out the tray slot → if all 3 slots null, regenerate tray → check game over → update high score if needed.
  - `reset()`: fresh board, fresh tray, score = 0, combo = 1, status = "playing". **Don't reset high score.**
  - `toggleMute()`: flip + persist.
  - On store creation: load `highScore` and `muted` from `localStorage` (with safe parsing — wrap in try/catch, default to 0 / false on any error).
- [x] Manual sanity: import the store in `App.tsx`, log state, place a piece programmatically via the action, log again. Confirm score and board update correctly. Then remove the debug code.

**STOP. Confirm store works in isolation before building UI.**

---

## Phase 3 — UI: board and tray (no drag yet)

Goal: render the current state. No interaction.

- [x] `src/components/Cell.tsx` — single grid cell. Props: `{ filled: boolean; color?: PieceColor }`. Tailwind classes only. Map colour names to Tailwind background classes (define the map as a const so it's tree-shakeable).
- [x] `src/components/Board.tsx` — render the 8×8 board from store state. Use CSS Grid (`grid-cols-8`).
- [x] `src/components/PieceView.tsx` — render a piece as a small grid based on its bounding box. Used by the tray and (later) the drag overlay.
- [x] `src/components/Tray.tsx` — render the three tray pieces. Show empty slots for already-placed (null) pieces.
- [x] `src/components/Hud.tsx` — score, high score, mute toggle button.
- [x] `src/components/App.tsx` — compose Hud, Board, Tray. Add a "Reset" button that calls `store.reset()` (useful for dev).
- [ ] Verify visually in `pnpm dev`. Resize the window — make sure layout doesn't explode.

**STOP. Show what it looks like, confirm visual is acceptable before adding drag.**

---

## Phase 4 — Drag and drop

- [ ] Wrap `App` in `<DndContext>` from `@dnd-kit/core`. Use the `PointerSensor` only (with an activation distance of 5px to avoid accidental drags on click).
- [ ] Make each tray piece a `useDraggable` source. The drag data carries the `trayIndex`.
- [ ] Make each board cell a `useDroppable` target. The drop data carries `{ row, col }`.
- [ ] On drag start: compute the offset from the pointer to the piece's top-left so the ghost aligns naturally.
- [ ] On drag over: compute the target cell under the pointer. Show a `<DragOverlay>` rendering the piece, tinted green-translucent if `isValidPlacement` returns true, red-translucent if false.
- [ ] On drag end: if valid, call `store.placePiece(trayIndex, row, col)`. If not, snap back (do nothing — the overlay just disappears).
- [ ] Verify: you can drag pieces, valid placements work, invalid ones reject, lines clear, the tray refills after all three are placed.

> **Watch out for:** the dnd-kit drop target detection is centre-based by default. For multi-cell pieces you'll likely want to compute the target by figuring out which board cell the piece's *top-left* would land on, given the pointer position and the original click offset. Don't rely on `over.id` from a single droppable — compute it from pointer coordinates.

**STOP. Game should be fully playable with mouse. Confirm before adding polish.**

---

## Phase 5 — Polish: clear animation, audio, game-over screen

- [ ] Add the clear-flash: when lines are about to clear, render the to-be-cleared cells in white for ~200ms before they vanish. Implement by setting a transient `clearing: Set<string>` (cell coordinates) in the store, removing it after the timeout. Don't block placement during the flash — that's a real footgun for UX.
- [ ] `src/audio/sounds.ts` — implement `playTone`, `playPlace`, `playClear(linesCount)`, `playCombo`, `playGameOver`. Lazy-init the `AudioContext` on first call. Respect the store's `muted` flag.
- [ ] Hook sounds into the store actions.
- [ ] `src/components/GameOverModal.tsx` — overlay shown when `status === "gameover"`. Shows final score, high score, "New best!" badge if applicable, and a "Play Again" button calling `store.reset()`.
- [ ] Style pass: pick a coherent colour palette for the seven piece colours that all read clearly against the board background. Tweak Hud styling. Make the page feel intentional, not like a Vite default.

**STOP. Final QA pass. Play through to game-over at least three times. Verify high score persists across page reloads.**

---

## Phase 6 — README and final clean-up

- [ ] `README.md` — what the game is, how to run it (`pnpm install && pnpm dev`), how to test (`pnpm test`), how to build (`pnpm build`). One screenshot.
- [ ] Remove any leftover debug logs, commented-out code, unused imports.
- [ ] Final `pnpm typecheck && pnpm test && pnpm build`. All three must pass.

**Done.**

---

## Appendix: things to push back on

If during the build you find yourself wanting to:

- Add a "smart" piece generator that avoids losses → **don't.** It's not in spec and it changes the game's character.
- Add piece rotation → **don't.** Out of scope for v1.
- Add particle effects, screen shake, juice → **ask first.** The spec says minimal. Juice is a rabbit hole.
- Refactor game logic to use classes instead of pure functions → **don't.** The pure-functional design is what makes the tests trivial.
- Add a state machine library (XState etc.) → **don't.** Zustand + a `status` field is enough.
- Add ESLint, Prettier, Husky, lint-staged → **ask first.** Nice to have but not needed to ship v1.
