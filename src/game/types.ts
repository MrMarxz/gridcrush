export type PieceColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink';
export type Offset = { row: number; col: number };
export type PieceShape = Offset[];
export type Piece = { id: string; shape: PieceShape; color: PieceColor };
export type Cell = { filled: false } | { filled: true; color: PieceColor };
export type Board = Cell[][];

export function createEmptyBoard(): Board {
  return Array.from({ length: 8 }, () =>
    Array.from({ length: 8 }, (): Cell => ({ filled: false }))
  );
}
