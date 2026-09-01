/**
 * renderHeatmap.ts — Renders the electric potential V as a color heatmap
 *
 * Color map (dark-mode optimized):
 *   V << 0  → cyan/blue
 *   V = 0   → black
 *   V >> 0  → red/yellow
 *
 * Renders at a reduced resolution then scales up for performance.
 */
import type { Charge } from '../physics/types';
import { electricPotential } from '../physics/coulomb';
import { WORLD_HALF } from '../physics/constants';

const HEATMAP_RES = 220; // internal resolution (220×220 → fast, looks smooth)

function potentialToRGB(V: number, Vmax: number): [number, number, number] {
  // Clamp to [-1, 1]
  const t = Math.max(-1, Math.min(1, V / Vmax));

  if (t > 0) {
    // positive: black(0) → red(0.5) → yellow(0.75) → white(1)
    if (t < 0.5) {
      const s = t * 2;
      return [Math.round(220 * s), 0, 0];
    } else if (t < 0.8) {
      const s = (t - 0.5) / 0.3;
      return [220, Math.round(180 * s), 0];
    } else {
      const s = (t - 0.8) / 0.2;
      return [220, Math.round(180 + 75 * s), Math.round(200 * s)];
    }
  } else {
    // negative: black(0) → blue(-0.5) → cyan(-0.8) → white(-1)
    const nt = -t;
    if (nt < 0.5) {
      const s = nt * 2;
      return [0, 0, Math.round(220 * s)];
    } else if (nt < 0.8) {
      const s = (nt - 0.5) / 0.3;
      return [0, Math.round(180 * s), 220];
    } else {
      const s = (nt - 0.8) / 0.2;
      return [Math.round(200 * s), Math.round(180 + 75 * s), 220];
    }
  }
}

export function renderHeatmap(
  ctx: CanvasRenderingContext2D,
  charges: Charge[],
  canvasW: number,
  canvasH: number,
  Vmax: number,
  opacity: number
): void {
  if (charges.length === 0) return;

  const tmp = document.createElement('canvas');
  tmp.width = HEATMAP_RES;
  tmp.height = HEATMAP_RES;
  const tCtx = tmp.getContext('2d')!;
  const imageData = tCtx.createImageData(HEATMAP_RES, HEATMAP_RES);
  const data = imageData.data;

  const worldSize = 2 * WORLD_HALF;
  // Aspect-ratio-aware: maintain square world in rectangular canvas
  const scale = Math.min(canvasW, canvasH) / worldSize;
  const ox = canvasW / 2;
  const oy = canvasH / 2;

  for (let py = 0; py < HEATMAP_RES; py++) {
    for (let px = 0; px < HEATMAP_RES; px++) {
      // Map pixel to canvas coords (centered)
      const cx = (px / HEATMAP_RES) * canvasW;
      const cy = (py / HEATMAP_RES) * canvasH;
      // Canvas to world
      const wx = (cx - ox) / scale;
      const wy = -(cy - oy) / scale; // flip Y

      const V = electricPotential(charges, { x: wx, y: wy });
      const [r, g, b] = potentialToRGB(V, Vmax);

      const i = (py * HEATMAP_RES + px) * 4;
      data[i]     = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }

  tCtx.putImageData(imageData, 0, 0);

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(tmp, 0, 0, canvasW, canvasH);
  ctx.restore();
}
