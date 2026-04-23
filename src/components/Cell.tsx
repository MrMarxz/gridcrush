import type { PieceColor } from '../game/types';

// Written out fully so Tailwind's content scanner includes them in the bundle.
const COLOR_CLASS: Record<PieceColor, string> = {
  red:    'bg-red-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-400',
  green:  'bg-emerald-500',
  blue:   'bg-blue-600',
  purple: 'bg-violet-500',
  pink:   'bg-rose-500',
};

type Props = {
  filled: boolean;
  color?: PieceColor;
  flashing?: boolean;
};

export function Cell({ filled, color, flashing }: Props) {
  if (flashing) {
    return <div className="w-12 h-12 bg-white" />;
  }
  if (!filled) {
    return <div className="w-12 h-12 bg-slate-200 border border-slate-300" />;
  }
  return (
    <div
      className={`w-12 h-12 shadow-[inset_0_2px_5px_rgba(0,0,0,0.25)] ${color ? COLOR_CLASS[color] : 'bg-gray-400'}`}
    />
  );
}
