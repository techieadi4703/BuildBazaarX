import { describe, it, expect } from 'vitest';
import { roomFloorAreaSqFt, roomWallAreaSqFt, paintLitres, tilesNeeded } from '../components/planner/bom';

describe('BOM Math Functions', () => {
  // A 10m x 10m room
  const squareRoom10x10: [number, number][] = [
    [0, 0],
    [0, 10],
    [10, 10],
    [10, 0]
  ];

  it('calculates floor area in sq ft correctly', () => {
    // 100 sq meters * 10.7639 = 1076.39
    const area = roomFloorAreaSqFt(squareRoom10x10);
    expect(area).toBeCloseTo(1076.39, 2);
  });

  it('calculates wall area in sq ft correctly (3m height default)', () => {
    // perimeter = 40m. 40 * 3 = 120 sq m. 120 * 10.7639 = 1291.668
    const area = roomWallAreaSqFt(squareRoom10x10);
    expect(area).toBeCloseTo(1291.668, 2);
  });

  it('calculates paint litres correctly', () => {
    // 1291.668 sq ft * 2 coats / 110 coverage = 23.48 -> ceil -> 24
    const litres = paintLitres(1291.668);
    expect(litres).toBe(24);
  });

  it('calculates tiles needed with wastage correctly', () => {
    // 1076.39 sq ft + 10% wastage = 1184.029 -> ceil -> 1185
    const tiles = tilesNeeded(1076.39);
    expect(tiles).toBe(1185);
  });

  it('handles empty or degenerate polygons safely', () => {
    expect(roomFloorAreaSqFt([])).toBe(0);
    expect(roomFloorAreaSqFt([[0, 0], [1, 1]])).toBe(0);
    expect(roomWallAreaSqFt([])).toBe(0);
    expect(roomWallAreaSqFt([[0, 0]])).toBe(0);
    expect(paintLitres(0)).toBe(0);
    expect(tilesNeeded(0)).toBe(0);
  });
});
