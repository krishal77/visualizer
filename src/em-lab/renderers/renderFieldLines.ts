/**
 * renderFieldLines.ts — Draws traced electric field lines onto canvas
 */
import type { FieldLine } from '../physics/fieldLines';
import type { CoordTransform } from './coordTransform';

export function renderFieldLines(
  ctx: CanvasRenderingContext2D,
  fieldLines: FieldLine[],
  transform: CoordTransform
): void {
  ctx.save();

  for (const line of fieldLines) {
    if (line.points.length < 2) continue;

    // Color based on source: positive = warm white, negative = cool white
    const alpha = 0.75;
    ctx.strokeStyle = line.sourceSign > 0
      ? `rgba(255, 220, 180, ${alpha})`
      : `rgba(180, 220, 255, ${alpha})`;
    ctx.lineWidth = 1.3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    const p0 = transform.worldToCanvas(line.points[0]);
    ctx.moveTo(p0.x, p0.y);

    for (let i = 1; i < line.points.length; i++) {
      const p = transform.worldToCanvas(line.points[i]);
      ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();

    // Draw arrowhead at ~60% of the line length
    if (line.points.length >= 4) {
      const mid = Math.floor(line.points.length * 0.55);
      const pA = transform.worldToCanvas(line.points[mid - 1]);
      const pB = transform.worldToCanvas(line.points[mid]);
      const dx = pB.x - pA.x;
      const dy = pB.y - pA.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0.5) {
        drawArrowhead(ctx, pB.x, pB.y, Math.atan2(dy, dx), 7, ctx.strokeStyle);
      }
    }
  }

  ctx.restore();
}

function drawArrowhead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  size: number,
  color: string
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size, -size * 0.45);
  ctx.lineTo(-size, size * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
