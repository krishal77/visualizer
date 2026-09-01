/**
 * renderVectors.ts — Renders the E-field as a grid of scaled arrows
 */
import type { Charge } from '../physics/types';
import { electricField } from '../physics/coulomb';
import { WORLD_HALF } from '../physics/constants';
import type { CoordTransform } from './coordTransform';

export function renderVectors(
  ctx: CanvasRenderingContext2D,
  charges: Charge[],
  transform: CoordTransform,
  spacing: number // world-units between arrows
): void {
  if (charges.length === 0) return;
  ctx.save();

  // Collect all magnitudes for relative scaling
  const samples: { wx: number; wy: number; Ex: number; Ey: number; mag: number }[] = [];
  for (let wx = -WORLD_HALF + spacing / 2; wx <= WORLD_HALF; wx += spacing) {
    for (let wy = -WORLD_HALF + spacing / 2; wy <= WORLD_HALF; wy += spacing) {
      const f = electricField(charges, { x: wx, y: wy });
      if (f.magnitude > 1e-6) {
        samples.push({ wx, wy, Ex: f.Ex, Ey: f.Ey, mag: f.magnitude });
      }
    }
  }

  const maxMag = Math.max(...samples.map((s) => s.mag));
  const arrowScale = (spacing * 0.85 * transform.scale) / maxMag ** 0.35;

  for (const { wx, wy, Ex, Ey, mag } of samples) {
    const { x: cx, y: cy } = transform.worldToCanvas({ x: wx, y: wy });
    const scaledLen = arrowScale * Math.log1p(mag) * 0.7;
    const nx = Ex / mag;
    const ny = -Ey / mag; // flip Y for canvas

    const t = Math.min(1, mag / (maxMag * 0.6));
    const r = Math.round(180 + 75 * t);
    const b = Math.round(220 - 180 * t);
    const color = `rgba(${r}, 160, ${b}, 0.85)`;

    drawArrow(ctx, cx, cy, nx * scaledLen, ny * scaledLen, color, Math.max(1, scaledLen * 0.06));
  }

  ctx.restore();
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dx: number,
  dy: number,
  color: string,
  lineW: number
): void {
  const ex = x + dx, ey = y + dy;
  const angle = Math.atan2(dy, dx);
  const hs = Math.min(8, Math.sqrt(dx * dx + dy * dy) * 0.35);

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineW;

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(ex, ey);
  ctx.stroke();

  ctx.save();
  ctx.translate(ex, ey);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-hs, -hs * 0.45);
  ctx.lineTo(-hs, hs * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
