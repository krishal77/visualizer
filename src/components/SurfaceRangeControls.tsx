import { clsx } from 'clsx';
import type {
  AppMode,
  CartesianRanges,
  CylindricalRanges,
  SphericalRanges,
  CoordRange,
} from '../types/coordinates';
import { toRad, toDeg } from '../utils/coordinateConversions';

// ─── Shared helpers ───────────────────────────────────────────────────────────

function safeNum(s: string, fallback: number): number {
  const n = parseFloat(s);
  return isNaN(n) ? fallback : n;
}

interface RangeRowProps {
  label: string;
  unit?: string;
  symbolColor: string;
  min: number;
  max: number;
  step?: number;
  /** Hard limits for the inputs */
  hardMin?: number;
  hardMax?: number;
  onMinChange: (v: number) => void;
  onMaxChange: (v: number) => void;
}

function RangeRow({
  label,
  unit = '',
  symbolColor,
  min,
  max,
  step = 0.1,
  hardMin = -20,
  hardMax = 20,
  onMinChange,
  onMaxChange,
}: RangeRowProps) {
  const fmtVal = (v: number) => v.toFixed(step < 1 ? 2 : 0);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className={clsx('text-xs font-mono font-bold w-14', symbolColor)}>
          {label}{unit && <span className="text-surface-500 font-normal">{unit}</span>}
        </span>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={fmtVal(min)}
            step={step}
            min={hardMin}
            max={max - step}
            onChange={(e) => {
              const v = safeNum(e.target.value, min);
              if (v < max) onMinChange(v);
            }}
            className="w-16 bg-surface-700 border border-surface-600 rounded-md px-1.5 py-1 text-xs font-mono text-white text-right focus:border-accent-primary focus:outline-none transition-colors"
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
              if (v > min) onMaxChange(v);
            }}
            className="w-16 bg-surface-700 border border-surface-600 rounded-md px-1.5 py-1 text-xs font-mono text-white text-right focus:border-accent-primary focus:outline-none transition-colors"
          />
        </div>
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

  // ── Cartesian range helpers ────────────────────────────────────────────────
  const setCart = (axis: keyof CartesianRanges, part: keyof CoordRange, v: number) =>
    onCartesianChange({ ...cartesianRanges, [axis]: { ...cartesianRanges[axis], [part]: v } });

  // ── Cylindrical range helpers ──────────────────────────────────────────────
  // theta is stored in radians; we display in degrees
  const setCyl = (coord: keyof CylindricalRanges, part: keyof CoordRange, v: number) => {
    let val = v;
    if (coord === 'theta') val = toRad(v);      // UI is in degrees → store radians
    onCylindricalChange({
      ...cylindricalRanges,
      [coord]: { ...cylindricalRanges[coord], [part]: val },
    });
  };

  // ── Spherical range helpers ────────────────────────────────────────────────
  const setSph = (coord: keyof SphericalRanges, part: keyof CoordRange, v: number) => {
    let val = v;
    if (coord === 'theta' || coord === 'phi') val = toRad(v);
    onSphericalChange({
      ...sphericalRanges,
      [coord]: { ...sphericalRanges[coord], [part]: val },
    });
  };

  const showCartesian  = mode === 'cartesian'  || mode === 'compare';
  const showCylindrical = mode === 'cylindrical' || mode === 'compare';
  const showSpherical  = mode === 'spherical'  || mode === 'compare';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-surface-500">
          Surface Ranges
        </h2>
        <span className="text-xs text-surface-500 italic">(min → max)</span>
      </div>

      {/* ── Cartesian ──────────────────────────────────────────────────────── */}
      {showCartesian && (
        <div className="bg-surface-800/60 rounded-xl border border-red-500/20 p-3 space-y-2">
          <h3 className="text-xs font-bold text-red-400 mb-2">Cartesian</h3>
          <RangeRow
            label="x" symbolColor="text-red-400"
            min={cartesianRanges.x.min} max={cartesianRanges.x.max}
            hardMin={-10} hardMax={10}
            onMinChange={(v) => setCart('x', 'min', v)}
            onMaxChange={(v) => setCart('x', 'max', v)}
          />
          <RangeRow
            label="y" symbolColor="text-green-400"
            min={cartesianRanges.y.min} max={cartesianRanges.y.max}
            hardMin={-10} hardMax={10}
            onMinChange={(v) => setCart('y', 'min', v)}
            onMaxChange={(v) => setCart('y', 'max', v)}
          />
          <RangeRow
            label="z" symbolColor="text-blue-400"
            min={cartesianRanges.z.min} max={cartesianRanges.z.max}
            hardMin={-10} hardMax={10}
            onMinChange={(v) => setCart('z', 'min', v)}
            onMaxChange={(v) => setCart('z', 'max', v)}
          />
        </div>
      )}

      {/* ── Cylindrical ────────────────────────────────────────────────────── */}
      {showCylindrical && (
        <div className="bg-surface-800/60 rounded-xl border border-orange-500/20 p-3 space-y-2">
          <h3 className="text-xs font-bold text-orange-400 mb-2">Cylindrical</h3>
          <RangeRow
            label="r" symbolColor="text-orange-400"
            min={cylindricalRanges.r.min} max={cylindricalRanges.r.max}
            hardMin={0} hardMax={10} step={0.1}
            onMinChange={(v) => setCyl('r', 'min', v)}
            onMaxChange={(v) => setCyl('r', 'max', v)}
          />
          <RangeRow
            label="θ" unit=" (°)" symbolColor="text-purple-400"
            min={toDeg(cylindricalRanges.theta.min)}
            max={toDeg(cylindricalRanges.theta.max)}
            hardMin={0} hardMax={360} step={1}
            onMinChange={(v) => setCyl('theta', 'min', v)}
            onMaxChange={(v) => setCyl('theta', 'max', v)}
          />
          <RangeRow
            label="z" symbolColor="text-blue-400"
            min={cylindricalRanges.z.min} max={cylindricalRanges.z.max}
            hardMin={-10} hardMax={10}
            onMinChange={(v) => setCyl('z', 'min', v)}
            onMaxChange={(v) => setCyl('z', 'max', v)}
          />
        </div>
      )}

      {/* ── Spherical ──────────────────────────────────────────────────────── */}
      {showSpherical && (
        <div className="bg-surface-800/60 rounded-xl border border-teal-500/20 p-3 space-y-2">
          <h3 className="text-xs font-bold text-teal-400 mb-2">Spherical</h3>
          <RangeRow
            label="ρ" symbolColor="text-teal-400"
            min={sphericalRanges.rho.min} max={sphericalRanges.rho.max}
            hardMin={0} hardMax={10} step={0.1}
            onMinChange={(v) => setSph('rho', 'min', v)}
            onMaxChange={(v) => setSph('rho', 'max', v)}
          />
          <RangeRow
            label="θ" unit=" (°)" symbolColor="text-purple-400"
            min={toDeg(sphericalRanges.theta.min)}
            max={toDeg(sphericalRanges.theta.max)}
            hardMin={0} hardMax={360} step={1}
            onMinChange={(v) => setSph('theta', 'min', v)}
            onMaxChange={(v) => setSph('theta', 'max', v)}
          />
          <RangeRow
            label="φ" unit=" (°)" symbolColor="text-pink-400"
            min={toDeg(sphericalRanges.phi.min)}
            max={toDeg(sphericalRanges.phi.max)}
            hardMin={0} hardMax={180} step={1}
            onMinChange={(v) => setSph('phi', 'min', v)}
            onMaxChange={(v) => setSph('phi', 'max', v)}
          />
        </div>
      )}
    </div>
  );
}
