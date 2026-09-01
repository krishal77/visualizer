/**
 * renderEquipotential.ts — Draws equipotential contour lines
 *
 * Positive V levels → warm lines (orange/red)
 * Negative V levels → cool lines (blue/cyan)
 * Colors transition smoothly to white near zero
 */
import type { EquipotentialContour } from '../physics/equipotential';
import type { CoordTransform } from './coordTransform';

function equipotentialColor(V: number, Vmax: number): string {
  const t = Math.max(0, Math.min(1, Math.abs(V) / Vmax));
  const alpha = 0.3 + 0.5 * t;
  if (V > 0) {
    const r = Math.round(180 + 75 * t);
    const g = Math.round(100 - 80 * t);
    return `rgba(${r}, ${g}, 60, ${alpha})`;
  } else {
    const b = Math.round(180 + 75 * t);
    const g = Math.round(100 - 60 * t);
    return `rgba(60, ${g}, ${b}, ${alpha})`;
  }
}

export function renderEquipotentials(
  ctx: CanvasRenderingContext2D,
  contours: EquipotentialContour[],
  transform: CoordTransform,
  Vmax: number
): void {
  ctx.save();

  for (const contour of contours) {
    const color = equipotentialColor(contour.V, Vmax);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.1;
    ctx.setLineDash([]);

    for (const seg of contour.segments) {
      const a = transform.worldToCanvas(seg.a);
      const b = transform.worldToCanvas(seg.b);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }

  ctx.restore();
}
