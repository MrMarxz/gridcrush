import type { Board } from './types';

const BOARD_SIZE = 8;

export function findClearedLines(board: Board): { rows: number[]; cols: number[] } {
  const rows: number[] = [];
  const cols: number[] = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    const boardRow = board[r];
    if (boardRow !== undefined && boardRow.every(cell => cell.filled)) {
      rows.push(r);
    }
  }

  for (let c = 0; c < BOARD_SIZE; c++) {
    if (board.every(boardRow => boardRow[c]?.filled === true)) {
      cols.push(c);
    }
  }

  return { rows, cols };
}

export function clearLines(
  board: Board,
  lines: { rows: number[]; cols: number[] },
): Board {
  const rowSet = new Set(lines.rows);
  const colSet = new Set(lines.cols);
  return board.map((row, r) =>
    row.map((cell, c): typeof cell =>
      rowSet.has(r) || colSet.has(c) ? { filled: false } : cell
    )
  );
}
