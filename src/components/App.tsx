import { useRef, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragCancelEvent, DragEndEvent, DragMoveEvent, DragStartEvent } from '@dnd-kit/core';
import { useGameStore } from '../store/game-store';
import { isValidPlacement } from '../game/placement';
import { Hud } from './Hud';
import { Board } from './Board';
import { Tray } from './Tray';
import { DragLayer } from './DragLayer';
import type { Piece } from '../game/types';

const CELL_SIZE = 48;

type DragState = {
  trayIndex: number;
  piece: Piece;
  // Pixel offset from the dragged element's top-left to the pointer at drag activation.
  // Used to align the ghost so the cell you grabbed stays under the cursor.
  clickOffsetPx: { x: number; y: number };
};

export default function App() {
  const boardRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [targetCell, setTargetCell] = useState<{ row: number; col: number } | null>(null);

  const reset = useGameStore(state => state.reset);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function computeTarget(
    pointerX: number,
    pointerY: number,
    offsetPx: { x: number; y: number },
  ): { row: number; col: number } | null {
    const boardEl = boardRef.current;
    if (!boardEl) return null;
    const rect = boardEl.getBoundingClientRect();
    const relX = pointerX - offsetPx.x - rect.left;
    const relY = pointerY - offsetPx.y - rect.top;
    return {
      col: Math.floor(relX / CELL_SIZE),
      row: Math.floor(relY / CELL_SIZE),
    };
  }

  function onDragStart(event: DragStartEvent) {
    const trayIndex = Number(event.active.id);
    const pieceFromTray = useGameStore.getState().tray[trayIndex];
    // null = slot already used; undefined = out-of-bounds index
    if (pieceFromTray == null) return;

    const activatorEvent = event.activatorEvent as PointerEvent;
    const pieceRect = event.active.rect.current.initial;

    const clickOffsetPx = pieceRect
      ? {
          x: activatorEvent.clientX - pieceRect.left,
          y: activatorEvent.clientY - pieceRect.top,
        }
      : { x: 0, y: 0 };

    setDragState({ trayIndex, piece: pieceFromTray, clickOffsetPx });
  }

  function onDragMove(event: DragMoveEvent) {
    if (!dragState) return;
    const activatorEvent = event.activatorEvent as PointerEvent;
    setTargetCell(
      computeTarget(
        activatorEvent.clientX + event.delta.x,
        activatorEvent.clientY + event.delta.y,
        dragState.clickOffsetPx,
      ),
    );
  }

  function onDragEnd(_event: DragEndEvent) {
    if (dragState && targetCell) {
      const { board, placePiece } = useGameStore.getState();
      const { trayIndex, piece } = dragState;
      if (isValidPlacement(board, piece, targetCell.row, targetCell.col)) {
        placePiece(trayIndex, targetCell.row, targetCell.col);
      }
    }
    setDragState(null);
    setTargetCell(null);
  }

  function onDragCancel(_event: DragCancelEvent) {
    setDragState(null);
    setTargetCell(null);
  }

  const isValid =
    dragState !== null &&
    targetCell !== null &&
    isValidPlacement(
      useGameStore.getState().board,
      dragState.piece,
      targetCell.row,
      targetCell.col,
    );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <div className="min-h-screen bg-gray-200 flex flex-col items-center justify-center p-8 gap-2">
        <Hud />
        {/* p-px + bg creates the 1-px grid-line frame without affecting the inner rect */}
        <div className="p-px bg-gray-400">
          <Board ref={boardRef} />
        </div>
        <Tray />
        <button
          onClick={reset}
          className="mt-4 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded text-sm font-medium"
        >
          New Game
        </button>
      </div>

      {dragState !== null && targetCell !== null && (
        <DragLayer
          piece={dragState.piece}
          targetCell={targetCell}
          boardRef={boardRef}
          isValid={isValid}
        />
      )}
    </DndContext>
  );
}
