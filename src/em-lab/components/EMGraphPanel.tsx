import { useMemo } from 'react';
import type { Charge } from '../physics/types';
import { electricField, electricPotential } from '../physics/coulomb';
import { K } from '../physics/constants';

interface EMGraphPanelProps {
  charges: Charge[];
  probeR?: number; // distance marker on graph
}

const GRAPH_W = 280;
const GRAPH_H = 100;
const PADDING = { left: 36, right: 10, top: 10, bottom: 24 };
const PLOT_W = GRAPH_W - PADDING.left - PADDING.right;
const PLOT_H = GRAPH_H - PADDING.top - PADDING.bottom;

const R_MIN = 0.12;
const R_MAX = 8;
const N_POINTS = 120;

function computeCurve(
  fn: (r: number) => number,
  rMin = R_MIN,
  rMax = R_MAX,
  n = N_POINTS
): { r: number; v: number }[] {
  return Array.from({ length: n }, (_, i) => {
    const r = rMin + ((rMax - rMin) * i) / (n - 1);
    const v = fn(r);
    return { r, v: isFinite(v) ? v : 0 };
  });
}

function rToX(r: number): number {
  return PADDING.left + ((r - R_MIN) / (R_MAX - R_MIN)) * PLOT_W;
}

function valToY(v: number, vMin: number, vMax: number): number {
  if (vMax === vMin) return PADDING.top + PLOT_H / 2;
  return PADDING.top + PLOT_H - ((v - vMin) / (vMax - vMin)) * PLOT_H;
}

function pointsToPath(pts: { r: number; v: number }[], vMin: number, vMax: number): string {
  return pts
    .map((p, i) => {
      const x = rToX(p.r);
      const y = valToY(p.v, vMin, vMax);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

function ticks(min: number, max: number, n = 4): number[] {
  const step = (max - min) / n;
  return Array.from({ length: n + 1 }, (_, i) => min + i * step);
}

function GraphSVG({
  title, curves, yLabel, color,
}: {
  title: string;
  curves: { points: { r: number; v: number }[]; color: string; label: string }[];
  yLabel: string;
  color: string;
}) {
  const allVals = curves.flatMap((c) => c.points.map((p) => p.v));
  const rawMin = Math.min(...allVals);
  const rawMax = Math.max(...allVals);
  const pad = (rawMax - rawMin) * 0.12 || 1;
  const vMin = rawMin - pad;
  const vMax = rawMax + pad;

  const yTicks = ticks(vMin, vMax, 3);
  const xTicks = [0, 2, 4, 6, 8];

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <h3 className={`text-xs font-bold ${color}`}>{title}</h3>
        <div className="flex gap-2">
          {curves.map((c) => (
            <span key={c.label} className="flex items-center gap-1 text-[9px] font-mono text-surface-400">
              <span className="w-4 h-0.5 inline-block rounded" style={{ backgroundColor: c.color }} />
              {c.label}
            </span>
          ))}
        </div>
      </div>
      <svg width={GRAPH_W} height={GRAPH_H} className="overflow-visible">
        {/* Axes */}
        <line x1={PADDING.left} y1={PADDING.top} x2={PADDING.left} y2={PADDING.top + PLOT_H}
          stroke="#484f58" strokeWidth="1" />
        <line x1={PADDING.left} y1={PADDING.top + PLOT_H}
          x2={PADDING.left + PLOT_W} y2={PADDING.top + PLOT_H}
          stroke="#484f58" strokeWidth="1" />

        {/* Zero line */}
        {vMin < 0 && vMax > 0 && (
          <line
            x1={PADDING.left} y1={valToY(0, vMin, vMax)}
            x2={PADDING.left + PLOT_W} y2={valToY(0, vMin, vMax)}
            stroke="#30363d" strokeWidth="1" strokeDasharray="3,2"
          />
        )}

        {/* Y ticks */}
        {yTicks.map((t) => (
          <g key={t}>
            <line
              x1={PADDING.left - 3} y1={valToY(t, vMin, vMax)}
              x2={PADDING.left} y2={valToY(t, vMin, vMax)}
              stroke="#484f58" strokeWidth="1"
            />
            <text
              x={PADDING.left - 4} y={valToY(t, vMin, vMax) + 3.5}
              textAnchor="end" fontSize="8" fill="#6e7681" fontFamily="monospace"
            >
              {t.toFixed(1)}
            </text>
          </g>
        ))}

        {/* X ticks */}
        {xTicks.map((t) => (
          <g key={t}>
            <line
              x1={rToX(t || R_MIN)} y1={PADDING.top + PLOT_H}
              x2={rToX(t || R_MIN)} y2={PADDING.top + PLOT_H + 3}
              stroke="#484f58" strokeWidth="1"
            />
            <text
              x={rToX(t || R_MIN)} y={PADDING.top + PLOT_H + 12}
              textAnchor="middle" fontSize="8" fill="#6e7681" fontFamily="monospace"
            >
              {t}
            </text>
          </g>
        ))}

        {/* Axis labels */}
        <text x={PADDING.left + PLOT_W / 2} y={GRAPH_H - 2}
          textAnchor="middle" fontSize="8" fill="#6e7681" fontFamily="monospace">
          r
        </text>
        <text
          transform={`translate(10, ${PADDING.top + PLOT_H / 2}) rotate(-90)`}
          textAnchor="middle" fontSize="8" fill="#6e7681" fontFamily="monospace"
        >
          {yLabel}
        </text>

        {/* Curves */}
        {curves.map((c) => (
          <path
            key={c.label}
            d={pointsToPath(c.points, vMin, vMax)}
            fill="none"
            stroke={c.color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
    </div>
  );
}

export function EMGraphPanel({ charges }: EMGraphPanelProps) {
  // Reference charge is first in the list (or a unit charge if empty)
  const refCharge = charges[0];

  const eGraph = useMemo(() => {
    if (!refCharge) return null;

    const eCurves = charges.map((c) => ({
      label: `q${charges.indexOf(c) + 1}`,
      color: c.q >= 0 ? '#ff7799' : '#66aaff',
      points: computeCurve((r) => Math.abs(K * c.q) / (r * r)),
    }));

    if (charges.length > 1) {
      eCurves.push({
        label: 'total',
        color: '#ffdd44',
        points: computeCurve((r) => {
          const pt = { x: refCharge.position.x + r, y: refCharge.position.y };
          return electricField(charges, pt).magnitude;
        }),
      });
    }

    return eCurves;
  }, [charges, refCharge]);

  const vGraph = useMemo(() => {
    if (!refCharge) return null;

    const vCurves = charges.map((c) => ({
      label: `q${charges.indexOf(c) + 1}`,
      color: c.q >= 0 ? '#ff7799' : '#66aaff',
      points: computeCurve((r) => K * c.q / r),
    }));

    if (charges.length > 1) {
      vCurves.push({
        label: 'total',
        color: '#bb88ff',
        points: computeCurve((r) => {
          const pt = { x: refCharge.position.x + r, y: refCharge.position.y };
          return electricPotential(charges, pt);
        }),
      });
    }

    return vCurves;
  }, [charges, refCharge]);

  if (charges.length === 0) {
    return (
      <div className="text-xs text-surface-500 italic text-center py-4">
        Add charges to see E(r) and V(r) graphs.
      </div>
    );
  }

  return (
    <div className="flex gap-6 overflow-x-auto">
      {eGraph && (
        <GraphSVG
          title="|E|(r)" yLabel="|E|" color="text-yellow-400" curves={eGraph}
        />
      )}
      {vGraph && (
        <GraphSVG
          title="V(r)" yLabel="V" color="text-purple-400" curves={vGraph}
        />
      )}
    </div>
  );
}
