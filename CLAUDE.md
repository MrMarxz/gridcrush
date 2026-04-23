# CLAUDE.md

This is the operating manual for working on this repository. Read it before every task.

## What this project is

A single-player, browser-based block puzzle game inspired by the "Block Blast" genre. Drag pieces from a tray onto an 8×8 grid; filling any full row or column clears it. Game ends when none of the three current pieces can fit anywhere on the board.

**This is not Block Blast.** Do not use that name in code, UI, README, or `package.json`. Working title in code: `gridcrush`. The user can rename later.

## Stack (locked — do not change without asking)

- **Vite 5+** with the `react-ts` template
- **React 18+** with **TypeScript** in `strict` mode
- **Tailwind CSS** for styling
- **@dnd-kit/core** for drag-and-drop (pointer sensor only for v1)
- **Zustand** for game state (lighter than Context+reducer for this; one store)
- **Vitest** for unit tests on game logic
- **No backend.** No router. No data fetching. Single-page, fully client-side.

If you find yourself reaching for any other dependency, stop and justify it in your response before installing.

## Files of record

- `SPEC.md` — game rules, data model, and acceptance criteria. This is the source of truth for behavior. If `SPEC.md` and your intuition disagree, `SPEC.md` wins.
- `TASKS.md` — the phased build order. Work in order. Do not skip ahead. Tick off checkboxes as you complete them.
- `CLAUDE.md` — this file. How to work.

## How to work

1. **Read `SPEC.md` and `TASKS.md` before writing any code.** Every session.
2. **Find the next unchecked task in `TASKS.md`.** Work on that one. Do not silently expand scope.
3. **For each task:**
   - State which task you're doing.
   - Make the change.
   - Run `pnpm typecheck` and `pnpm test` (once those scripts exist). Fix what you broke before moving on.
   - Tick the checkbox in `TASKS.md`.
4. **At the end of each phase, stop and summarise what shipped, what's still open, and any spec ambiguities you hit.** Wait for the user before starting the next phase.

## Hard rules

- **Pure functions for game logic.** Everything in `src/game/` (placement validation, line clearing, game-over detection, scoring) must be pure: input state → output state, no React, no DOM, no `Math.random` called inside them. Pass an RNG in. This is what makes them testable.
- **Game logic must have unit tests.** Coverage target: every function in `src/game/` has at least one test. Edge cases are not optional — see `SPEC.md` §7 for the required test cases.
- **No `any`. No `@ts-ignore`.** If types are fighting you, the design is wrong. Fix the design.
- **Don't invent rules.** If `SPEC.md` is silent on something (e.g. "what colour are the pieces?"), pick a sensible default and call it out in your response so the user can override.
- **Don't add features that aren't in `TASKS.md`.** No "while I was in there" additions. No menus, no settings, no themes, no leaderboards, no animations beyond what's specified, no extra piece shapes. Scope creep kills vibe-coded projects.

## Out of scope for v1 (do not build)

- Mobile / touch support
- Multiplayer or online leaderboards
- Account system, auth, backend of any kind
- Levels, missions, daily challenges
- Power-ups (bombs, swaps, hints)
- Piece rotation
- Themes, skins, settings menus
- Animations beyond the clear-flash specified in `SPEC.md` §6

If the user asks for these later, that's a v2 conversation.

## Style

- Functional React components with hooks. No class components.
- Co-locate: `Component.tsx` lives next to `Component.test.tsx` when tested.
- Tailwind for layout and colour. No CSS modules, no styled-components, no inline `style` props except for dynamic transforms during drag.
- File names: `kebab-case.ts` for utilities, `PascalCase.tsx` for components.
- Imports ordered: React → libraries → local absolute → local relative.

## When you're stuck

If you can't figure out how to do something, **stop and ask**. Don't guess and ship something half-broken. The user prefers a question over a wrong assumption.
