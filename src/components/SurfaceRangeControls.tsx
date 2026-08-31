import { clsx } from 'clsx';
import type {
  AppMode,
  CartesianRanges,
  CylindricalRanges,
  SphericalRanges,
  CoordRange,
} from '../types/coordinates';
import { toRad, toDeg } from '../utils/coordinateConversions';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function safeNum(s: string, fallback: number): number {
  const n = parseFloat(s);
  return isNaN(n) ? fallback : n;
}

// ─── RangeRow ─────────────────────────────────────────────────────────────────

interface RangeRowProps {
  label: string;
  unit?: string;
  /** Tailwind text color class for the label */
  symbolColor: string;
  /** Hex color used to tint the sliders */
  accentHex: string;
  min: number;
  max: number;
  step?: number;
  hardMin?: number;
  hardMax?: number;
  onMinChange: (v: number) => void;
  onMaxChange: (v: number) => void;
}

function RangeRow({
  label,
  unit = '',
  symbolColor,
  accentHex,
  min,
  max,
  step = 0.1,
  hardMin = -10,
  hardMax = 10,
  onMinChange,
  onMaxChange,
}: RangeRowProps) {
  const decimals = step < 1 ? 2 : 0;
  const fmtVal = (v: number) => v.toFixed(decimals);

  // Slider fill percentage helpers
  const pct = (v: number) =>
    (((v - hardMin) / (hardMax - hardMin)) * 100).toFixed(1) + '%';

  const sliderStyle = (value: number, isMin: boolean) => ({
    background: isMin
      ? `linear-gradient(to right, #30363d ${pct(value)}, ${accentHex} ${pct(value)}, ${accentHex} ${pct(max)}, #30363d ${pct(max)})`
      : `linear-gradient(to right, #30363d ${pct(min)}, ${accentHex} ${pct(min)}, ${accentHex} ${pct(value)}, #30363d ${pct(value)})`,
  });

  return (
    <div className="space-y-1.5 pb-2 border-b border-surface-700/40 last:border-0 last:pb-0">
      {/* Label + numeric inputs */}
      <div className="flex items-center justify-between">
        <span className={clsx('text-xs font-mono font-bold w-14', symbolColor)}>
          {label}
          {unit && <span className="text-surface-500 font-normal">{unit}</span>}
        </span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={fmtVal(min)}
            step={step}
            min={hardMin}
            max={max - step}
            onChange={(e) => {
              const v = safeNum(e.target.value, min);
              if (v < max) onMinChange(parseFloat(v.toFixed(decimals)));
            }}
            className="w-[60px] bg-surface-700 border border-surface-600 rounded-md px-1.5 py-1 text-xs font-mono text-white text-right focus:border-accent-primary focus:outline-none transition-colors"
          />
          <span className="text-surface-500 text-xs font-mono">→</span>
          <input
            type="number"
            value={fmtVal(max)}
            step={step}
            min={min + step}
            max={hardMax}
            onChange={(e) => {
              const v = safeNum(e.target.value, max);
              if (v > min) onMaxChange(parseFloat(v.toFixed(decimals)));
            }}
            className="w-[60px] bg-surface-700 border border-surface-600 rounded-md px-1.5 py-1 text-xs font-mono text-white text-right focus:border-accent-primary focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Min slider */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-surface-500 w-6 text-right font-mono">min</span>
        <input
          type="range"
          min={hardMin}
          max={hardMax}
          step={step}
          value={min}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (v < max) onMinChange(v);
          }}
          className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
          style={sliderStyle(min, true)}
        />
        <span className="text-[10px] font-mono text-surface-400 w-10 text-right">
          {fmtVal(min)}
        </span>
      </div>

      {/* Max slider */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-surface-500 w-6 text-right font-mono">max</span>
        <input
          type="range"
          min={hardMin}
          max={hardMax}
          step={step}
          value={max}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (v > min) onMaxChange(v);
          }}
          className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
          style={sliderStyle(max, false)}
        />
        <span className="text-[10px] font-mono text-surface-400 w-10 text-right">
          {fmtVal(max)}
        </span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface SurfaceRangeControlsProps {
  mode: AppMode;
  cartesianRanges: CartesianRanges;
  cylindricalRanges: CylindricalRanges;
  sphericalRanges: SphericalRanges;
  onCartesianChange: (r: CartesianRanges) => void;
  onCylindricalChange: (r: CylindricalRanges) => void;
  onSphericalChange: (r: SphericalRanges) => void;
}

export function SurfaceRangeControls({
  mode,
  cartesianRanges,
  cylindricalRanges,
  sphericalRanges,
  onCartesianChange,
  onCylindricalChange,
  onSphericalChange,
}: SurfaceRangeControlsProps) {

  const setCart = (axis: keyof CartesianRanges, part: keyof CoordRange, v: number) =>
    onCartesianChange({ ...cartesianRanges, [axis]: { ...cartesianRanges[axis], [part]: v } });

  const setCyl = (coord: keyof CylindricalRanges, part: keyof CoordRange, v: number) => {
    const val = coord === 'theta' ? toRad(v) : v;
    onCylindricalChange({ ...cylindricalRanges, [coord]: { ...cylindricalRanges[coord], [part]: val } });
  };

  const setSph = (coord: keyof SphericalRanges, part: keyof CoordRange, v: number) => {
    const val = coord === 'theta' || coord === 'phi' ? toRad(v) : v;
    onSphericalChange({ ...sphericalRanges, [coord]: { ...sphericalRanges[coord], [part]: val } });
  };

  const showCart = mode === 'cartesian'   || mode === 'compare';
  const showCyl  = mode === 'cylindrical' || mode === 'compare';
  const showSph  = mode === 'spherical'   || mode === 'compare';

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-surface-500">
          Surface Ranges
        </h2>
        <span className="text-xs text-surface-500 italic">(drag sliders)</span>
      </div>

      {/* ── Cartesian ──────────────────────────────────────────────────────── */}
      {showCart && (
        <div className="bg-surface-800/60 rounded-xl border border-red-500/20 p-3 space-y-3">
          <h3 className="text-xs font-bold text-red-400">Cartesian</h3>

          <RangeRow
            label="x" symbolColor="text-red-400" accentHex="#ff4444"
            min={cartesianRanges.x.min} max={cartesianRanges.x.max}
            step={0.1} hardMin={-10} hardMax={10}
            onMinChange={(v) => setCart('x', 'min', v)}
            onMaxChange={(v) => setCart('x', 'max', v)}
          />
          <RangeRow
            label="y" symbolColor="text-green-400" accentHex="#44ff44"
            min={cartesianRanges.y.min} max={cartesianRanges.y.max}
            step={0.1} hardMin={-10} hardMax={10}
            onMinChange={(v) => setCart('y', 'min', v)}
            onMaxChange={(v) => setCart('y', 'max', v)}
          />
          <RangeRow
            label="z" symbolColor="text-blue-400" accentHex="#4488ff"
            min={cartesianRanges.z.min} max={cartesianRanges.z.max}
            step={0.1} hardMin={-10} hardMax={10}
            onMinChange={(v) => setCart('z', 'min', v)}
            onMaxChange={(v) => setCart('z', 'max', v)}
          />
        </div>
      )}

      {/* ── Cylindrical ────────────────────────────────────────────────────── */}
      {showCyl && (
        <div className="bg-surface-800/60 rounded-xl border border-orange-500/20 p-3 space-y-3">
          <h3 className="text-xs font-bold text-orange-400">Cylindrical</h3>

          <RangeRow
            label="r" symbolColor="text-orange-400" accentHex="#ff9933"
            min={cylindricalRanges.r.min} max={cylindricalRanges.r.max}
            step={0.05} hardMin={0} hardMax={10}
            onMinChange={(v) => setCyl('r', 'min', v)}
            onMaxChange={(v) => setCyl('r', 'max', v)}
          />
          <RangeRow
            label="θ" unit=" °" symbolColor="text-purple-400" accentHex="#cc44ff"
            min={toDeg(cylindricalRanges.theta.min)}
            max={toDeg(cylindricalRanges.theta.max)}
            step={1} hardMin={0} hardMax={360}
            onMinChange={(v) => setCyl('theta', 'min', v)}
            onMaxChange={(v) => setCyl('theta', 'max', v)}
          />
          <RangeRow
            label="z" symbolColor="text-blue-400" accentHex="#4488ff"
            min={cylindricalRanges.z.min} max={cylindricalRanges.z.max}
            step={0.1} hardMin={-10} hardMax={10}
            onMinChange={(v) => setCyl('z', 'min', v)}
            onMaxChange={(v) => setCyl('z', 'max', v)}
          />
        </div>
      )}

      {/* ── Spherical ──────────────────────────────────────────────────────── */}
      {showSph && (
        <div className="bg-surface-800/60 rounded-xl border border-teal-500/20 p-3 space-y-3">
          <h3 className="text-xs font-bold text-teal-400">Spherical</h3>

          <RangeRow
            label="ρ" symbolColor="text-teal-400" accentHex="#44ffcc"
            min={sphericalRanges.rho.min} max={sphericalRanges.rho.max}
            step={0.05} hardMin={0} hardMax={10}
            onMinChange={(v) => setSph('rho', 'min', v)}
            onMaxChange={(v) => setSph('rho', 'max', v)}
          />
          <RangeRow
            label="θ" unit=" °" symbolColor="text-purple-400" accentHex="#cc44ff"
            min={toDeg(sphericalRanges.theta.min)}
            max={toDeg(sphericalRanges.theta.max)}
            step={1} hardMin={0} hardMax={360}
            onMinChange={(v) => setSph('theta', 'min', v)}
            onMaxChange={(v) => setSph('theta', 'max', v)}
          />
          <RangeRow
            label="φ" unit=" °" symbolColor="text-pink-400" accentHex="#ff44cc"
            min={toDeg(sphericalRanges.phi.min)}
            max={toDeg(sphericalRanges.phi.max)}
            step={1} hardMin={0} hardMax={180}
            onMinChange={(v) => setSph('phi', 'min', v)}
            onMaxChange={(v) => setSph('phi', 'max', v)}
          />
        </div>
      )}
    </div>
  );
}
