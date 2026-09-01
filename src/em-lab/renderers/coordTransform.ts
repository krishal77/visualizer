/**
 * coordTransform.ts — World ↔ Canvas coordinate transforms
 *
 * World: x ∈ [-WORLD_HALF, +WORLD_HALF], y ∈ [-WORLD_HALF, +WORLD_HALF]
 * Canvas: u ∈ [0, W], v ∈ [0, H], with v increasing downward
 *
 * Maintains aspect ratio — world appears square regardless of canvas shape.
 */
import type { Vec2 } from '../physics/types';
import { WORLD_HALF } from '../physics/constants';

export interface CoordTransform {
  scale: number;     // pixels per world unit
  offsetX: number;   // canvas center X
  offsetY: number;   // canvas center Y
  worldToCanvas: (w: Vec2) => Vec2;
  canvasToWorld: (c: Vec2) => Vec2;
}

export function createTransform(canvasW: number, canvasH: number): CoordTransform {
  const scale = Math.min(canvasW, canvasH) / (2 * WORLD_HALF);
  const offsetX = canvasW / 2;
  const offsetY = canvasH / 2;

  return {
    scale,
    offsetX,
    offsetY,
    worldToCanvas: (w) => ({
      x: w.x * scale + offsetX,
      y: -w.y * scale + offsetY,   // flip Y
    }),
    canvasToWorld: (c) => ({
      x: (c.x - offsetX) / scale,
      y: -(c.y - offsetY) / scale, // flip Y
    }),
  };
}
