import type { AppSettings } from '../types/coordinates';
import { clsx } from 'clsx';

interface SettingsPanelProps {
  settings: AppSettings;
  onChange: (s: AppSettings) => void;
}

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
}

function Toggle({ label, checked, onChange, id }: ToggleProps) {
  return (
    <label
      htmlFor={id}
      className="flex items-center justify-between cursor-pointer group py-1"
    >
      <span className="text-xs text-surface-400 group-hover:text-white transition-colors">
        {label}
      </span>
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={clsx(
            'w-9 h-5 rounded-full transition-all duration-200',
            checked ? 'bg-accent-glow' : 'bg-surface-600'
          )}
        />
        <div
          className={clsx(
            'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200',
            checked ? 'left-[18px]' : 'left-0.5'
          )}
        />
      </div>
    </label>
  );
}

export function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  const set = (key: keyof AppSettings) => (v: boolean) =>
    onChange({ ...settings, [key]: v });

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-surface-500">
        Display Settings
      </h2>
      <div className="bg-surface-800/60 rounded-xl border border-surface-700/50 px-4 py-3 space-y-0.5">
        <Toggle id="toggle-grid" label="Show Grid" checked={settings.showGrid} onChange={set('showGrid')} />
        <Toggle id="toggle-projections" label="Show Projections" checked={settings.showProjections} onChange={set('showProjections')} />
        <Toggle id="toggle-arcs" label="Show Angle Arcs" checked={settings.showAngleArcs} onChange={set('showAngleArcs')} />
        <Toggle id="toggle-labels" label="Show Labels" checked={settings.showLabels} onChange={set('showLabels')} />
        <Toggle id="toggle-planes" label="Show Coord. Planes" checked={settings.showCoordPlanes} onChange={set('showCoordPlanes')} />
      </div>

      {/* Dark / Light mode */}
      <div className="bg-surface-800/60 rounded-xl border border-surface-700/50 px-4 py-3">
        <Toggle
          id="toggle-dark-mode"
          label={settings.darkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
          checked={settings.darkMode}
          onChange={set('darkMode')}
        />
      </div>
    </div>
  );
}
