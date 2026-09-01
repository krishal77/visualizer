/**
 * equipotential.ts — Marching Squares algorithm for equipotential contour lines
 *
 * Given a scalar potential field V(x,y) sampled on a regular grid,
 * produces line segments forming iso-potential contours at specified V levels.
 *
 * Reference: Marching Squares — Paul Bourke
 */
import type { Vec2, Charge } from './types';
import { electricPotential } from './coulomb';
import { WORLD_HALF } from './constants';

export interface LineSegment {
  a: Vec2;
  b: Vec2;
}

export interface EquipotentialContour {
  V: number;
  segments: LineSegment[];
}

// ─── Grid sampling ────────────────────────────────────────────────────────────

function sampleGrid(
  charges: Charge[],
  resolution: number
): { grid: Float32Array; cellW: number; cellH: number } {
  const size = 2 * WORLD_HALF;
  const cellW = size / (resolution - 1);
  const cellH = size / (resolution - 1);
  const grid = new Float32Array(resolution * resolution);

  for (let j = 0; j < resolution; j++) {
    for (let i = 0; i < resolution; i++) {
      const wx = -WORLD_HALF + i * cellW;
      const wy = -WORLD_HALF + j * cellH;
      grid[j * resolution + i] = electricPotential(charges, { x: wx, y: wy });
    }
  }
  return { grid, cellW, cellH };
}

// ─── Linear interpolation of edge crossing ───────────────────────────────────

function lerp(v0: number, v1: number, t0: number, t1: number, iso: number): number {
  if (Math.abs(t1 - t0) < 1e-10) return (v0 + v1) / 2;
  return v0 + (v1 - v0) * (iso - t0) / (t1 - t0);
}

// ─── Marching Squares for one iso-level ───────────────────────────────────────

function marchingSquaresForLevel(
  grid: Float32Array,
  resolution: number,
  cellW: number,
  cellH: number,
  iso: number
): LineSegment[] {
  const segments: LineSegment[] = [];

  for (let j = 0; j < resolution - 1; j++) {
    for (let i = 0; i < resolution - 1; i++) {
      // Corner values
      const bl = grid[j * resolution + i];
      const br = grid[j * resolution + (i + 1)];
      const tl = grid[(j + 1) * resolution + i];
      const tr = grid[(j + 1) * resolution + (i + 1)];

      // Skip degenerate cells (near-infinite potential near charge)
      if (!isFinite(bl) || !isFinite(br) || !isFinite(tl) || !isFinite(tr)) continue;

      // Corner world positions
      const x0 = -WORLD_HALF + i * cellW;
      const x1 = x0 + cellW;
      const y0 = -WORLD_HALF + j * cellH;
      const y1 = y0 + cellH;

      // Marching squares index (4-bit, one bit per corner)
      let idx = 0;
      if (bl >= iso) idx |= 1;
      if (br >= iso) idx |= 2;
      if (tr >= iso) idx |= 4;
      if (tl >= iso) idx |= 8;

      // All same side → no crossing
      if (idx === 0 || idx === 15) continue;

      // Edge midpoints (interpolated)
      const mB: Vec2 = { x: lerp(x0, x1, bl, br, iso), y: y0 }; // bottom
      const mR: Vec2 = { x: x1, y: lerp(y0, y1, br, tr, iso) }; // right
      const mT: Vec2 = { x: lerp(x0, x1, tl, tr, iso), y: y1 }; // top
      const mL: Vec2 = { x: x0, y: lerp(y0, y1, bl, tl, iso) }; // left

      // Lookup table — produces line segments per case
      switch (idx) {
        case 1:  case 14: segments.push({ a: mB, b: mL }); break;
        case 2:  case 13: segments.push({ a: mB, b: mR }); break;
        case 3:  case 12: segments.push({ a: mL, b: mR }); break;
        case 4:  case 11: segments.push({ a: mR, b: mT }); break;
        case 5:           segments.push({ a: mB, b: mL }, { a: mR, b: mT }); break;
        case 6:  case 9:  segments.push({ a: mB, b: mT }); break;
        case 7:  case 8:  segments.push({ a: mL, b: mT }); break;
        case 10:          segments.push({ a: mB, b: mR }, { a: mL, b: mT }); break;
      }
    }
  }

  return segments;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Compute equipotential contour lines.
 * @param charges      Array of point charges
 * @param count        Number of iso-levels to generate
 * @param resolution   Grid resolution (higher = smoother, slower)
 * @param Vmax         Color range clamp — contours span [-Vmax, +Vmax]
 */
export function computeEquipotentials(
  charges: Charge[],
  count: number,
  resolution = 120,
  Vmax = 4
): EquipotentialContour[] {
  if (charges.length === 0) return [];

  const { grid, cellW, cellH } = sampleGrid(charges, resolution);

  // Generate iso-levels: exclude 0 to avoid clutter at the exact symmetry plane
  const contours: EquipotentialContour[] = [];
  const half = Math.floor(count / 2);

  for (let k = -half; k <= half; k++) {
    if (k === 0) continue;
    const V = (k / half) * Vmax * 0.85; // slightly inside Vmax so lines are visible
    const segments = marchingSquaresForLevel(grid, resolution, cellW, cellH, V);
    if (segments.length > 0) contours.push({ V, segments });
  }

  return contours;
}
