import type { ProbeSample } from '../physics/types';
import { clsx } from 'clsx';

interface EMProbePanelProps {
  probe: ProbeSample | null;
}

function fmt(v: number, decimals = 3): string {
  if (!isFinite(v)) return '∞';
  return v.toFixed(decimals);
}

function angleDeg(rad: number): string {
  return `${((rad * 180) / Math.PI).toFixed(1)}°`;
}

function ValueRow({
  label,
  value,
  unit = '',
  color = 'text-white',
  subscript,
}: {
  label: string;
  value: string;
  unit?: string;
  color?: string;
  subscript?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-surface-700/40 last:border-0">
      <span className="text-xs text-surface-400 font-mono">
        {label}
        {subscript && <sub className="text-[9px]">{subscript}</sub>}
      </span>
      <span className={clsx('text-xs font-mono font-bold tabular-nums', color)}>
        {value}
        {unit && <span className="text-surface-500 font-normal ml-1">{unit}</span>}
      </span>
    </div>
  );
}

export function EMProbePanel({ probe }: EMProbePanelProps) {
  if (!probe) {
    return (
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-surface-500">
          Probe
        </h2>
        <div className="bg-surface-800/60 rounded-xl border border-surface-700/50 p-4 text-center">
          <p className="text-xs text-surface-500 italic">
            Hover over the canvas to probe the field at any point.
          </p>
        </div>
      </div>
    );
  }

  const VColor = probe.V > 0 ? 'text-red-300' : probe.V < 0 ? 'text-blue-300' : 'text-white';
  const Emag = probe.magnitude;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-surface-500">
          Probe
        </h2>
        <span className="text-[10px] font-mono text-surface-500">
          ({fmt(probe.worldX, 2)}, {fmt(probe.worldY, 2)})
        </span>
      </div>

      {/* Main values */}
      <div className="bg-surface-800/60 rounded-xl border border-surface-700/40 p-3">
        <ValueRow label="V" value={fmt(probe.V)} unit="V" color={VColor} />
        <ValueRow label="|E|" value={fmt(Emag)} unit="N/C" color="text-yellow-300" />
        <ValueRow label="Ex" value={fmt(probe.Ex)} unit="N/C" color="text-surface-300" />
        <ValueRow label="Ey" value={fmt(probe.Ey)} unit="N/C" color="text-surface-300" />
        <ValueRow label="∠E" value={angleDeg(probe.angle)} color="text-purple-300" />
      </div>

      {/* Per-charge breakdown */}
      {probe.distances.length > 0 && (
        <div className="space-y-1.5">
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-surface-500">
            Per-charge contributions
          </h3>
          <div className="space-y-1.5">
            {probe.distances.map((d, i) => (
              <div
                key={d.id}
                className={clsx(
                  'rounded-lg border p-2.5 space-y-1',
                  d.q >= 0
                    ? 'border-red-500/20 bg-red-500/5'
                    : 'border-blue-500/20 bg-blue-500/5'
                )}
              >
                <div className="flex justify-between text-[10px] font-mono">
                  <span className={d.q >= 0 ? 'text-red-400' : 'text-blue-400'}>
                    q{i + 1} = {d.q > 0 ? '+' : ''}{d.q.toFixed(1)}
                  </span>
                  <span className="text-surface-500">r = {fmt(d.r, 2)}</span>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-surface-400">
                  <span>V = {fmt(d.Vi, 2)}</span>
                  <span>|E| = {fmt(d.Ei, 2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
