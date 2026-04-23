# GridCrush

A single-player browser-based block puzzle game. Drag pieces from the tray onto the 8×8 grid. Fill any complete row or column to clear it and score points. The game ends when none of the three current pieces can fit anywhere on the board.

## How to play

- Drag a piece from the tray onto the board
- Any full row or column clears automatically
- Clear multiple lines at once for bonus points
- Clear lines on consecutive placements to build a combo multiplier
- The game ends when no piece in the tray can be placed anywhere

## Running locally

```bash
pnpm install
pnpm dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build (output: `dist/`) |
| `pnpm typecheck` | TypeScript type check (no emit) |
| `pnpm test` | Run unit tests (Vitest) |
| `pnpm test:watch` | Run tests in watch mode |

## Stack

- [Vite](https://vitejs.dev/) + [React 18](https://react.dev/) + TypeScript (strict)
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [@dnd-kit/core](https://dndkit.com/) for drag-and-drop
- [Zustand](https://zustand-demo.pmnd.rs/) for game state
- [Vitest](https://vitest.dev/) for unit tests on game logic
