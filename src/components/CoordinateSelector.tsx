import type { AppMode } from '../types/coordinates';
import { clsx } from 'clsx';

interface CoordinateSelectorProps {
  mode: AppMode;
  onChange: (mode: AppMode) => void;
}

const MODES: { key: AppMode; label: string; icon: string; color: string }[] = [
  { key: 'cartesian', label: 'Cartesian', icon: '⊞', color: 'text-red-400' },
  { key: 'cylindrical', label: 'Cylindrical', icon: '⊙', color: 'text-orange-400' },
  { key: 'spherical', label: 'Spherical', icon: '◉', color: 'text-teal-400' },
  { key: 'compare', label: 'Compare All', icon: '⊕', color: 'text-accent-secondary' },
];

export function CoordinateSelector({ mode, onChange }: CoordinateSelectorProps) {
  return (
    <div className="space-y-1.5">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-surface-500 mb-3">
        Coordinate System
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {MODES.map(({ key, label, icon, color }) => (
          <button
            key={key}
            id={`mode-${key}`}
            onClick={() => onChange(key)}
            className={clsx(
              'flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border',
              mode === key
                ? 'bg-accent-glow/20 border-accent-primary/50 text-white shadow-glow'
                : 'bg-surface-700/50 border-surface-600/50 text-surface-500 hover:text-white hover:bg-surface-700 hover:border-surface-500'
            )}
          >
            <span className={clsx('text-base', mode === key ? color : 'opacity-50')}>{icon}</span>
            <span className="text-xs leading-tight">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
