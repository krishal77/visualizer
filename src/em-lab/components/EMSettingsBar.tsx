import type { EMSettings } from '../physics/types';
import { clsx } from 'clsx';

interface Toggle {
  key: keyof EMSettings;
  label: string;
  color: string;
}

const TOGGLES: Toggle[] = [
  { key: 'showHeatmap',       label: 'Potential heatmap',   color: 'text-purple-400' },
  { key: 'showEquipotentials',label: 'Equipotential lines', color: 'text-orange-400' },
  { key: 'showFieldLines',    label: 'Field lines',         color: 'text-yellow-400' },
  { key: 'showVectors',       label: 'Vector arrows',       color: 'text-teal-400'   },
  { key: 'showChargeLabels',  label: 'Charge labels',       color: 'text-surface-400'},
];

interface EMSettingsBarProps {
  settings: EMSettings;
  onChange: (s: EMSettings) => void;
}

export function EMSettingsBar({ settings, onChange }: EMSettingsBarProps) {
  const toggle = (key: keyof EMSettings) =>
    onChange({ ...settings, [key]: !settings[key as keyof typeof settings] });

  const set = (key: keyof EMSettings, value: number) =>
    onChange({ ...settings, [key]: value });

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-surface-500">
        Visualization
      </h2>

      {/* Toggles */}
      <div className="space-y-1.5">
        {TOGGLES.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => toggle(key)}
            className={clsx(
              'w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs transition-all duration-200',
              (settings[key] as boolean)
                ? 'border-surface-600 bg-surface-700/50'
                : 'border-surface-700/30 bg-transparent opacity-50'
            )}
          >
            <span className={color}>{label}</span>
            <div className={clsx(
              'w-7 h-3.5 rounded-full transition-colors relative',
              (settings[key] as boolean) ? 'bg-accent-primary' : 'bg-surface-600'
            )}>
              <div className={clsx(
                'absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all',
                (settings[key] as boolean) ? 'left-3.5' : 'left-0.5'
              )} />
            </div>
          </button>
        ))}
      </div>

      {/* Sliders */}
      <div className="space-y-3 border-t border-surface-700/50 pt-3">
        <SliderRow
          label="Heatmap opacity"
          value={settings.heatmapOpacity}
          min={0.1} max={1} step={0.05}
          onChange={(v) => set('heatmapOpacity', v)}
          fmt={(v) => `${Math.round(v * 100)}%`}
          color="#aa66ff"
        />
        <SliderRow
          label="V max (color clamp)"
          value={settings.Vmax}
          min={0.5} max={10} step={0.5}
          onChange={(v) => set('Vmax', v)}
          fmt={(v) => v.toFixed(1)}
          color="#ff9933"
        />
        <SliderRow
          label="Field lines / charge"
          value={settings.fieldLineCount}
          min={4} max={20} step={1}
          onChange={(v) => set('fieldLineCount', v)}
          fmt={(v) => String(Math.round(v))}
          color="#ffdd44"
        />
        <SliderRow
          label="Equipotential levels"
          value={settings.equipotentialCount}
          min={4} max={30} step={2}
          onChange={(v) => set('equipotentialCount', v)}
          fmt={(v) => String(Math.round(v))}
          color="#ff9933"
        />
      </div>
    </div>
  );
}

function SliderRow({
  label, value, min, max, step, onChange, fmt, color,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; fmt: (v: number) => string; color: string;
}) {
  const pct = ((value - min) / (max - min) * 100).toFixed(1) + '%';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-mono text-surface-400">
        <span>{label}</span>
        <span style={{ color }}>{fmt(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, ${color} ${pct}, #30363d ${pct})` }}
      />
    </div>
  );
}
