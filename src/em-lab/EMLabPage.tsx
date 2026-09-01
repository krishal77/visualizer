import { useState, useCallback } from 'react';
import { clsx } from 'clsx';
import type { Charge, ProbeSample, EMSettings } from './physics/types';
import { DEFAULT_EM_SETTINGS } from './physics/constants';
import { PRESETS } from './presets';
import { EMLabCanvas } from './components/EMLabCanvas';
import { EMChargeControls } from './components/EMChargeControls';
import { EMProbePanel } from './components/EMProbePanel';
import { EMFormulaPanel } from './components/EMFormulaPanel';
import { EMGraphPanel } from './components/EMGraphPanel';
import { EMSettingsBar } from './components/EMSettingsBar';

let _id = 100;
function newId() { return `c${_id++}`; }

function makeCharges(preset: typeof PRESETS[0]): Charge[] {
  return preset.charges.map((c) => ({ id: newId(), q: c.q, position: { ...c.position } }));
}

export function EMLabPage() {
  const [charges, setCharges] = useState<Charge[]>(makeCharges(PRESETS[2])); // default: dipole
  const [probe, setProbe] = useState<ProbeSample | null>(null);
  const [settings, setSettings] = useState<EMSettings>(DEFAULT_EM_SETTINGS);

  const handleProbeChange = useCallback((p: ProbeSample | null) => setProbe(p), []);
  const handleChargesChange = useCallback((c: Charge[]) => setCharges(c), []);

  return (
    <div className="flex-1 flex overflow-hidden">

      {/* ── Left Panel ─────────────────────────────────────────────────────── */}
      <aside className="w-72 flex-shrink-0 flex flex-col border-r border-surface-700 bg-surface-800/50 overflow-y-auto">
        <div className="p-4 space-y-6">
          <EMChargeControls
            charges={charges}
            onChange={handleChargesChange}
          />
          <div className="border-t border-surface-700/50" />
          <EMSettingsBar settings={settings} onChange={setSettings} />
        </div>
      </aside>

      {/* ── Center + Bottom ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Canvas */}
        <main className="flex-1 relative overflow-hidden">
          <EMLabCanvas
            charges={charges}
            settings={settings}
            onProbeChange={handleProbeChange}
            onChargesChange={handleChargesChange}
          />

          {/* Legend overlay */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-1 pointer-events-none">
            <LegendItem color="#ff4466" label="Positive charge" />
            <LegendItem color="#3399ff" label="Negative charge" />
            <LegendItem color="rgba(255,220,180,0.75)" label="Field lines" />
            <LegendItem color="rgba(255,170,60,0.7)" label="Equipotential (V > 0)" />
            <LegendItem color="rgba(60,130,255,0.7)" label="Equipotential (V < 0)" />
          </div>
        </main>

        {/* Bottom: Graphs */}
        <div className={clsx(
          'flex-shrink-0 border-t border-surface-700 bg-surface-800/70 px-6 py-3',
        )}>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-surface-500">
              Graphs
            </h2>
            <span className="text-[10px] text-surface-600">
              from charge q₁ outward along +x
            </span>
          </div>
          <EMGraphPanel charges={charges} />
        </div>
      </div>

      {/* ── Right Panel ──────────────────────────────────────────────────────── */}
      <aside className="w-80 flex-shrink-0 flex flex-col border-l border-surface-700 bg-surface-800/50 overflow-y-auto">
        <div className="p-4 space-y-5">
          <EMProbePanel probe={probe} />
          <div className="border-t border-surface-700/50" />
          <EMFormulaPanel probe={probe} charges={charges} />
        </div>
      </aside>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
      <span className="text-[10px] text-surface-500">{label}</span>
    </div>
  );
}
