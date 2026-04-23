import type { Board, Cell, Piece } from './types';

const BOARD_SIZE = 8;

export function isValidPlacement(board: Board, piece: Piece, row: number, col: number): boolean {
  return piece.shape.every(({ row: dr, col: dc }) => {
    const r = row + dr;
    const c = col + dc;
    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) return false;
    return board[r]?.[c]?.filled === false;
  });
}

export function placePiece(board: Board, piece: Piece, row: number, col: number): Board {
  const newBoard: Board = board.map((r): Cell[] => [...r]);
  for (const { row: dr, col: dc } of piece.shape) {
    const r = row + dr;
    const c = col + dc;
    const boardRow = newBoard[r];
    if (boardRow !== undefined) {
      boardRow[c] = { filled: true, color: piece.color };
    }
  }
  return newBoard;
}
