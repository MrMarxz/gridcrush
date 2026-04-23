import { describe, it, expect } from 'vitest';
import { PIECE_POOL, randomPiece } from './pieces';
import { mulberry32 } from './rng';

describe('PIECE_POOL shapes', () => {
  it('every shape is normalised (min row = 0, min col = 0)', () => {
    for (const shape of PIECE_POOL) {
      const minRow = Math.min(...shape.map(o => o.row));
      const minCol = Math.min(...shape.map(o => o.col));
      expect(minRow).toBe(0);
      expect(minCol).toBe(0);
    }
  });

  it('no shape has duplicate offsets', () => {
    for (const shape of PIECE_POOL) {
      const keys = shape.map(o => `${o.row},${o.col}`);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it('every shape fits inside an 8×8 board', () => {
    for (const shape of PIECE_POOL) {
      for (const { row, col } of shape) {
        expect(row).toBeGreaterThanOrEqual(0);
        expect(row).toBeLessThan(8);
        expect(col).toBeGreaterThanOrEqual(0);
        expect(col).toBeLessThan(8);
      }
    }
  });

  it('the piece pool contains exactly 31 distinct pieces', () => {
    expect(PIECE_POOL.length).toBe(31);
  });
});

describe('randomPiece', () => {
  it('is deterministic with a seeded RNG', () => {
    const rng1 = mulberry32(42);
    const rng2 = mulberry32(42);
    const p1 = randomPiece(rng1);
    const p2 = randomPiece(rng2);
    expect(p1.shape).toEqual(p2.shape);
    expect(p1.color).toEqual(p2.color);
  });

  it('produces different results with different seeds', () => {
    const results = new Set(
      Array.from({ length: 20 }, (_, i) => {
        const rng = mulberry32(i);
        const p = randomPiece(rng);
        return `${p.shape[0]?.row},${p.color}`;
      })
    );
    expect(results.size).toBeGreaterThan(1);
  });
});
