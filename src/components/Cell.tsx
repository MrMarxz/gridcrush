import type { PieceColor } from '../game/types';

// Strings must be written out fully so Tailwind's content scanner includes them in the bundle.
const COLOR_CLASS: Record<PieceColor, string> = {
  red:    'bg-red-500',
  orange: 'bg-orange-400',
  yellow: 'bg-yellow-400',
  green:  'bg-green-500',
  blue:   'bg-blue-500',
  purple: 'bg-purple-500',
  pink:   'bg-pink-400',
};

type Props = {
  filled: boolean;
  color?: PieceColor;
};

export function Cell({ filled, color }: Props) {
  if (!filled) {
    return <div className="w-12 h-12 bg-gray-100 border border-gray-300" />;
  }
  return (
    <div className={`w-12 h-12 shadow-inner ${color ? COLOR_CLASS[color] : 'bg-gray-400'}`} />
  );
}
