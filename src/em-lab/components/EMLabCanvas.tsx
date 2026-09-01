/**
 * EMLabCanvas.tsx — Main 2D interactive electrostatics canvas
 *
 * Responsibilities:
 *  - Renders heatmap, field lines, equipotentials, vector arrows, charge markers, probe
 *  - Mouse: drag charges, move probe
 *  - Exposes probe + drag callbacks to parent
 *  - Re-renders whenever charges, settings, or probe position change
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import type { Charge, ProbeSample, EMSettings } from '../physics/types';
import { probeSample } from '../physics/coulomb';
import { computeFieldLines } from '../physics/fieldLines';
import { computeEquipotentials } from '../physics/equipotential';
import { createTransform } from '../renderers/coordTransform';
import { renderHeatmap } from '../renderers/renderHeatmap';
import { renderFieldLines } from '../renderers/renderFieldLines';
import { renderEquipotentials } from '../renderers/renderEquipotential';
import { renderVectors } from '../renderers/renderVectors';
import { WORLD_HALF, FL_SEED_RADIUS } from '../physics/constants';

interface EMLabCanvasProps {
  charges: Charge[];
  settings: EMSettings;
  onProbeChange: (probe: ProbeSample | null) => void;
  onChargesChange: (charges: Charge[]) => void;
}

const CHARGE_RADIUS_PX = 18; // hitbox radius for drag

export function EMLabCanvas({
  charges,
  settings,
  onProbeChange,
  onChargesChange,
}: EMLabCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragIdRef = useRef<string | null>(null);
  const dragOffsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const [probePos, setProbePos] = useState<{ x: number; y: number } | null>(null);

  // ── Render ──────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const transform = createTransform(W, H);

    // Clear
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, W, H);

    // Grid lines
    drawGrid(ctx, transform, W, H);

    // Heatmap
    if (settings.showHeatmap && charges.length > 0) {
      renderHeatmap(ctx, charges, W, H, settings.Vmax, settings.heatmapOpacity);
    }

    // Equipotential lines
    if (settings.showEquipotentials && charges.length > 0) {
      const contours = computeEquipotentials(charges, settings.equipotentialCount, 120, settings.Vmax);
      renderEquipotentials(ctx, contours, transform, settings.Vmax);
    }

    // Field lines
    if (settings.showFieldLines && charges.length > 0) {
      const lines = computeFieldLines(charges, settings.fieldLineCount);
      renderFieldLines(ctx, lines, transform);
    }

    // Vector arrows
    if (settings.showVectors && charges.length > 0) {
      renderVectors(ctx, charges, transform, settings.vectorSpacing);
    }

    // Charges
    for (const charge of charges) {
      drawCharge(ctx, charge, transform, settings.showChargeLabels);
    }

    // Probe
    if (probePos && charges.length > 0) {
      const sample = probeSample(charges, probePos.x, probePos.y);
      drawProbe(ctx, sample, transform);
      onProbeChange(sample);
    } else if (!probePos) {
      onProbeChange(null);
    }
  }, [charges, settings, probePos, onProbeChange]);

  useEffect(() => { draw(); }, [draw]);

  // ── Resize observer ─────────────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      draw();
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [draw]);

  // ── Mouse event helpers ─────────────────────────────────────────────────────
  function getCanvasPos(e: React.MouseEvent) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { cx: e.clientX - rect.left, cy: e.clientY - rect.top };
  }

  function getWorldPos(e: React.MouseEvent) {
    const { cx, cy } = getCanvasPos(e);
    const canvas = canvasRef.current!;
    const transform = createTransform(canvas.width, canvas.height);
    return transform.canvasToWorld({ x: cx, y: cy });
  }

  function findCharge(cx: number, cy: number): string | null {
    const canvas = canvasRef.current!;
    const transform = createTransform(canvas.width, canvas.height);
    for (const c of charges) {
      const cp = transform.worldToCanvas(c.position);
      const d = Math.sqrt((cx - cp.x) ** 2 + (cy - cp.y) ** 2);
      if (d <= CHARGE_RADIUS_PX) return c.id;
    }
    return null;
  }

  // ── Mouse handlers ──────────────────────────────────────────────────────────
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const { cx, cy } = getCanvasPos(e);
    const hitId = findCharge(cx, cy);
    if (hitId) {
      dragIdRef.current = hitId;
      const charge = charges.find((c) => c.id === hitId)!;
      const canvas = canvasRef.current!;
      const transform = createTransform(canvas.width, canvas.height);
      const cp = transform.worldToCanvas(charge.position);
      dragOffsetRef.current = { dx: cp.x - cx, dy: cp.y - cy };
    }
  }, [charges]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const { cx, cy } = getCanvasPos(e);

    if (dragIdRef.current) {
      const canvas = canvasRef.current!;
      const transform = createTransform(canvas.width, canvas.height);
      const wx = transform.canvasToWorld({ x: cx + dragOffsetRef.current.dx, y: cy + dragOffsetRef.current.dy });
      // Clamp to world bounds
      const clamped = {
        x: Math.max(-WORLD_HALF + 0.2, Math.min(WORLD_HALF - 0.2, wx.x)),
        y: Math.max(-WORLD_HALF + 0.2, Math.min(WORLD_HALF - 0.2, wx.y)),
      };
      onChargesChange(
        charges.map((c) => c.id === dragIdRef.current ? { ...c, position: clamped } : c)
      );
      return;
    }

    if (charges.length > 0) {
      const wp = getWorldPos(e);
      setProbePos(wp);
    }
  }, [charges, onChargesChange]);

  const handleMouseUp = useCallback(() => {
    dragIdRef.current = null;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!dragIdRef.current) setProbePos(null);
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
      {/* Axis labels */}
      <div className="absolute bottom-6 right-6 text-[10px] text-surface-600 font-mono pointer-events-none select-none">
        x → right · y → up · k=1 (normalized)
      </div>
    </div>
  );
}

// ─── Canvas drawing helpers ───────────────────────────────────────────────────

function drawGrid(
  ctx: CanvasRenderingContext2D,
  transform: ReturnType<typeof createTransform>,
  W: number,
  H: number
) {
  ctx.save();
  ctx.strokeStyle = 'rgba(48, 54, 61, 0.7)';
  ctx.lineWidth = 0.5;

  for (let wx = -WORLD_HALF; wx <= WORLD_HALF; wx++) {
    const { x } = transform.worldToCanvas({ x: wx, y: 0 });
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let wy = -WORLD_HALF; wy <= WORLD_HALF; wy++) {
    const { y } = transform.worldToCanvas({ x: 0, y: wy });
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Bold axes
  ctx.strokeStyle = 'rgba(80, 90, 100, 0.9)';
  ctx.lineWidth = 1.2;
  const { x: axisX } = transform.worldToCanvas({ x: 0, y: 0 });
  const { y: axisY } = transform.worldToCanvas({ x: 0, y: 0 });
  ctx.beginPath(); ctx.moveTo(axisX, 0); ctx.lineTo(axisX, H); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, axisY); ctx.lineTo(W, axisY); ctx.stroke();

  ctx.restore();
}

function drawCharge(
  ctx: CanvasRenderingContext2D,
  charge: Charge,
  transform: ReturnType<typeof createTransform>,
  showLabel: boolean
) {
  const { x, y } = transform.worldToCanvas(charge.position);
  const r = CHARGE_RADIUS_PX;
  const isPos = charge.q >= 0;
  const color = isPos ? '#ff4466' : '#3399ff';
  const glow = isPos ? 'rgba(255, 68, 102, 0.35)' : 'rgba(51, 153, 255, 0.35)';

  // Glow halo
  ctx.save();
  ctx.shadowColor = glow;
  ctx.shadowBlur = 18;

  // Outer ring
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Fill
  const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r);
  grad.addColorStop(0, isPos ? 'rgba(255, 120, 150, 0.9)' : 'rgba(100, 170, 255, 0.9)');
  grad.addColorStop(1, isPos ? 'rgba(200, 20, 60, 0.85)' : 'rgba(20, 80, 200, 0.85)');
  ctx.fillStyle = grad;
  ctx.fill();

  // Symbol
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${r}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isPos ? '+' : '−', x, y + 1);

  // Label: magnitude
  if (showLabel) {
    ctx.font = '10px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillText(`q=${charge.q > 0 ? '+' : ''}${charge.q.toFixed(1)}`, x, y + r + 12);
  }

  ctx.restore();
}

function drawProbe(
  ctx: CanvasRenderingContext2D,
  sample: ProbeSample,
  transform: ReturnType<typeof createTransform>
) {
  const { x, y } = transform.worldToCanvas({ x: sample.worldX, y: sample.worldY });
  const s = 8;

  ctx.save();

  // Crosshair
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 2]);
  ctx.beginPath();
  ctx.moveTo(x - s, y); ctx.lineTo(x + s, y);
  ctx.moveTo(x, y - s); ctx.lineTo(x, y + s);
  ctx.stroke();
  ctx.setLineDash([]);

  // Dot
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.fill();

  // E-field direction arrow
  if (sample.magnitude > 1e-4) {
    const arrowLen = 28;
    const ex = x + arrowLen * Math.cos(sample.angle);
    const ey = y - arrowLen * Math.sin(sample.angle); // flip Y
    ctx.strokeStyle = '#ffdd44';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    // Arrowhead
    const ha = 7;
    const ang = Math.atan2(ey - y, ex - x);
    ctx.fillStyle = '#ffdd44';
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - ha * Math.cos(ang - 0.4), ey - ha * Math.sin(ang - 0.4));
    ctx.lineTo(ex - ha * Math.cos(ang + 0.4), ey - ha * Math.sin(ang + 0.4));
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();

  void FL_SEED_RADIUS; // suppress unused import warning
}
