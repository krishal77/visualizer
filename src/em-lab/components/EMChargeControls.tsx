import { clsx } from 'clsx';
import type { Charge } from '../physics/types';
import { PRESETS } from '../presets';

let idCounter = 1;
function newId() { return `charge-${idCounter++}`; }

function presetsToCharges(preset: typeof PRESETS[0]): Charge[] {
  return preset.charges.map((c) => ({ id: newId(), q: c.q, position: { ...c.position } }));
}

interface EMChargeControlsProps {
  charges: Charge[];
  onChange: (charges: Charge[]) => void;
}

export function EMChargeControls({ charges, onChange }: EMChargeControlsProps) {
  const addCharge = (sign: 1 | -1) => {
    const offset = (charges.length % 4) * 0.6;
    onChange([
      ...charges,
      { id: newId(), q: sign * 1, position: { x: -1 + offset, y: 1 - offset } },
    ]);
  };

  const removeCharge = (id: string) => onChange(charges.filter((c) => c.id !== id));

  const updateQ = (id: string, q: number) =>
    onChange(charges.map((c) => (c.id === id ? { ...c, q } : c)));

  const applyPreset = (preset: typeof PRESETS[0]) => onChange(presetsToCharges(preset));

  const resetAll = () => onChange([]);

  return (
    <div className="space-y-4">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-surface-500">
          Charges
        </h2>
        <button
          onClick={resetAll}
          className="text-xs text-surface-500 hover:text-red-400 transition-colors"
        >
          Clear all
        </button>
      </div>

      {/* ── Add buttons ─────────────────────────────────────────────────────── */}
      <div className="flex gap-2">
        <button
          id="add-positive-charge"
          onClick={() => addCharge(1)}
          className="flex-1 py-2 rounded-lg text-xs font-bold border-2 border-red-500/40 text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all duration-200"
        >
          + Add Positive
        </button>
        <button
          id="add-negative-charge"
          onClick={() => addCharge(-1)}
          className="flex-1 py-2 rounded-lg text-xs font-bold border-2 border-blue-500/40 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 transition-all duration-200"
        >
          − Add Negative
        </button>
      </div>

      {/* ── Charge list ─────────────────────────────────────────────────────── */}
      {charges.length === 0 && (
        <p className="text-xs text-surface-500 italic text-center py-2">
          No charges. Add one or pick a preset.
        </p>
      )}
      <div className="space-y-2">
        {charges.map((c, i) => (
          <div
            key={c.id}
            className={clsx(
              'rounded-xl border p-3 space-y-2',
              c.q >= 0
                ? 'border-red-500/25 bg-red-500/5'
                : 'border-blue-500/25 bg-blue-500/5'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={clsx(
                  'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold',
                  c.q >= 0 ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                )}>
                  {c.q >= 0 ? '+' : '−'}
                </div>
                <span className="text-xs text-surface-400 font-mono">
                  Charge {i + 1}
                </span>
              </div>
              <button
                onClick={() => removeCharge(c.id)}
                className="text-surface-600 hover:text-red-400 text-xs transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Magnitude slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-surface-500 font-mono">
                <span>q = {c.q > 0 ? '+' : ''}{c.q.toFixed(1)}</span>
                <span>pos ({c.position.x.toFixed(1)}, {c.position.y.toFixed(1)})</span>
              </div>
              <input
                type="range"
                min={-5} max={5} step={0.1}
                value={c.q}
                onChange={(e) => updateQ(c.id, parseFloat(e.target.value))}
                className="w-full h-1.5 appearance-none rounded-full cursor-pointer"
                style={{
                  background: c.q >= 0
                    ? `linear-gradient(to right, #333 ${((c.q + 5) / 10 * 100).toFixed(1)}%, #ff4466 ${((c.q + 5) / 10 * 100).toFixed(1)}%)`
                    : `linear-gradient(to right, #3399ff ${((c.q + 5) / 10 * 100).toFixed(1)}%, #333 ${((c.q + 5) / 10 * 100).toFixed(1)}%)`,
                }}
              />
              <div className="flex justify-between text-[9px] text-surface-600 font-mono">
                <span>−5</span><span>0</span><span>+5</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Presets ─────────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-surface-500">
          Presets
        </h3>
        <div className="grid grid-cols-2 gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              title={p.description}
              className="text-xs py-1.5 px-2 rounded-lg border border-surface-600/40 text-surface-400 hover:border-accent-primary/40 hover:text-white hover:bg-accent-glow/10 transition-all duration-200 text-left"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
