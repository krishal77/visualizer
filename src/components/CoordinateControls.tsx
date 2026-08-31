import { useState } from 'react';
import type { CartesianCoords, CylindricalCoords, SphericalCoords, AppMode } from '../types/coordinates';
import { POINT_MIN, POINT_MAX } from '../types/coordinates';
import {
  cartesianToCylindrical,
  cartesianToSpherical,
  cylindricalToCartesian,
  sphericalToCartesian,
  toDeg,
  toRad,
  fmt,
  clamp,
} from '../utils/coordinateConversions';
import { clsx } from 'clsx';

interface Preset {
  name: string;
  point: CartesianCoords;
}

const PRESETS: Preset[] = [
  { name: 'Origin', point: { x: 0, y: 0, z: 0 } },
  { name: 'X Axis', point: { x: 3, y: 0, z: 0 } },
  { name: 'Y Axis', point: { x: 0, y: 3, z: 0 } },
  { name: 'Z Axis', point: { x: 0, y: 0, z: 3 } },
  { name: 'XY Plane', point: { x: 3, y: 3, z: 0 } },
  { name: 'XZ Plane', point: { x: 3, y: 0, z: 3 } },
  { name: 'YZ Plane', point: { x: 0, y: 3, z: 3 } },
  { name: 'Example 1', point: { x: 3, y: 4, z: 5 } },
  { name: 'Example 2', point: { x: -2, y: 2, z: 3 } },
  { name: 'Random', point: { x: 0, y: 0, z: 0 } }, // handled specially
];

interface SliderRowProps {
  label: string;
  color: string;
  value: number;
  onChange: (v: number) => void;
}

function SliderRow({ label, color, value, onChange }: SliderRowProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className={clsx('text-sm font-mono font-bold', color)}>{label}</span>
        <input
          type="number"
          value={fmt(value)}
          step={0.1}
          min={POINT_MIN}
          max={POINT_MAX}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) onChange(clamp(v, POINT_MIN, POINT_MAX));
          }}
          className="w-20 bg-surface-700 border border-surface-600 rounded-lg px-2 py-1 text-xs font-mono text-right text-white focus:border-accent-primary focus:outline-none transition-colors"
        />
      </div>
      <input
        type="range"
        min={POINT_MIN}
        max={POINT_MAX}
        step={0.05}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${color.includes('red') ? '#ff4444' : color.includes('green') ? '#44ff44' : '#4488ff'} 0%, ${color.includes('red') ? '#ff4444' : color.includes('green') ? '#44ff44' : '#4488ff'} ${((value - POINT_MIN) / (POINT_MAX - POINT_MIN)) * 100}%, #30363d ${((value - POINT_MIN) / (POINT_MAX - POINT_MIN)) * 100}%, #30363d 100%)`,
        }}
      />
      <div className="flex justify-between text-xs text-surface-500 font-mono">
        <span>{POINT_MIN}</span>
        <span>{POINT_MAX}</span>
      </div>
    </div>
  );
}

interface CoordinateControlsProps {
  position: CartesianCoords;
  cylindrical: CylindricalCoords;
  spherical: SphericalCoords;
  mode: AppMode;
  onPositionChange: (p: CartesianCoords) => void;
  onPlayAnimation: () => void;
  isAnimating: boolean;
}

export function CoordinateControls({
  position,
  cylindrical,
  spherical,
  mode,
  onPositionChange,
  onPlayAnimation,
  isAnimating,
}: CoordinateControlsProps) {
  const [inputSystem, setInputSystem] = useState<'cartesian' | 'cylindrical' | 'spherical'>('cartesian');

  // Cylindrical direct input state (in degrees for display)
  const [cylInput, setCylInput] = useState({ r: '', theta: '', z: '' });
  const [sphInput, setSphInput] = useState({ rho: '', theta: '', phi: '' });

  const setX = (x: number) => onPositionChange({ ...position, x });
  const setY = (y: number) => onPositionChange({ ...position, y });
  const setZ = (z: number) => onPositionChange({ ...position, z });

  const handlePreset = (preset: Preset) => {
    if (preset.name === 'Random') {
      onPositionChange({
        x: parseFloat((Math.random() * 8 - 4).toFixed(2)),
        y: parseFloat((Math.random() * 8 - 4).toFixed(2)),
        z: parseFloat((Math.random() * 8 - 4).toFixed(2)),
      });
    } else {
      onPositionChange(preset.point);
    }
  };

  const applyCylindricalInput = () => {
    const r = parseFloat(cylInput.r);
    const thetaDeg = parseFloat(cylInput.theta);
    const z = parseFloat(cylInput.z);
    if (!isNaN(r) && !isNaN(thetaDeg) && !isNaN(z)) {
      const cart = cylindricalToCartesian({ r: Math.max(0, r), theta: toRad(thetaDeg), z });
      onPositionChange({
        x: clamp(cart.x, POINT_MIN, POINT_MAX),
        y: clamp(cart.y, POINT_MIN, POINT_MAX),
        z: clamp(cart.z, POINT_MIN, POINT_MAX),
      });
    }
  };

  const applySphericalInput = () => {
    const rho = parseFloat(sphInput.rho);
    const thetaDeg = parseFloat(sphInput.theta);
    const phiDeg = parseFloat(sphInput.phi);
    if (!isNaN(rho) && !isNaN(thetaDeg) && !isNaN(phiDeg)) {
      const cart = sphericalToCartesian({
        rho: Math.max(0, rho),
        theta: toRad(thetaDeg),
        phi: toRad(clamp(phiDeg, 0, 180)),
      });
      onPositionChange({
        x: clamp(cart.x, POINT_MIN, POINT_MAX),
        y: clamp(cart.y, POINT_MIN, POINT_MAX),
        z: clamp(cart.z, POINT_MIN, POINT_MAX),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* XYZ Sliders */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-surface-500">
          Point Position
        </h2>
        <SliderRow label="X" color="text-red-400" value={position.x} onChange={setX} />
        <SliderRow label="Y" color="text-green-400" value={position.y} onChange={setY} />
        <SliderRow label="Z" color="text-blue-400" value={position.z} onChange={setZ} />
      </div>

      {/* Direct coordinate input */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-surface-500">
          Direct Input
        </h2>
        <div className="flex gap-1 bg-surface-700/50 p-1 rounded-lg">
          {(['cartesian', 'cylindrical', 'spherical'] as const).map((sys) => (
            <button
              key={sys}
              onClick={() => setInputSystem(sys)}
              className={clsx(
                'flex-1 text-xs py-1 rounded-md transition-all duration-150 font-medium',
                inputSystem === sys
                  ? 'bg-surface-600 text-white'
                  : 'text-surface-500 hover:text-white'
              )}
            >
              {sys === 'cartesian' ? 'Cart.' : sys === 'cylindrical' ? 'Cyl.' : 'Sph.'}
            </button>
          ))}
        </div>

        {inputSystem === 'cylindrical' && (
          <div className="space-y-2">
            {[
              { label: 'r', placeholder: fmt(cylindrical.r), value: cylInput.r, key: 'r' as const, color: 'text-orange-400' },
              { label: 'θ (°)', placeholder: fmt(toDeg(cylindrical.theta)), value: cylInput.theta, key: 'theta' as const, color: 'text-purple-400' },
              { label: 'z', placeholder: fmt(cylindrical.z), value: cylInput.z, key: 'z' as const, color: 'text-blue-400' },
            ].map(({ label, placeholder, value, key, color }) => (
              <div key={key} className="flex items-center gap-2">
                <span className={clsx('w-12 text-xs font-mono font-bold', color)}>{label}</span>
                <input
                  type="number"
                  placeholder={placeholder}
                  value={value}
                  onChange={(e) => setCylInput((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="flex-1 bg-surface-700 border border-surface-600 rounded-lg px-2 py-1.5 text-xs font-mono text-white focus:border-accent-primary focus:outline-none transition-colors placeholder:text-surface-500"
                />
              </div>
            ))}
            <button
              onClick={applyCylindricalInput}
              className="w-full bg-accent-glow/30 hover:bg-accent-glow/50 border border-accent-primary/30 text-accent-secondary text-xs font-medium py-1.5 rounded-lg transition-all duration-200"
            >
              Apply Cylindrical →
            </button>
          </div>
        )}

        {inputSystem === 'spherical' && (
          <div className="space-y-2">
            {[
              { label: 'ρ', placeholder: fmt(spherical.rho), value: sphInput.rho, key: 'rho' as const, color: 'text-teal-400' },
              { label: 'θ (°)', placeholder: fmt(toDeg(spherical.theta)), value: sphInput.theta, key: 'theta' as const, color: 'text-purple-400' },
              { label: 'φ (°)', placeholder: fmt(toDeg(spherical.phi)), value: sphInput.phi, key: 'phi' as const, color: 'text-pink-400' },
            ].map(({ label, placeholder, value, key, color }) => (
              <div key={key} className="flex items-center gap-2">
                <span className={clsx('w-12 text-xs font-mono font-bold', color)}>{label}</span>
                <input
                  type="number"
                  placeholder={placeholder}
                  value={value}
                  onChange={(e) => setSphInput((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="flex-1 bg-surface-700 border border-surface-600 rounded-lg px-2 py-1.5 text-xs font-mono text-white focus:border-accent-primary focus:outline-none transition-colors placeholder:text-surface-500"
                />
              </div>
            ))}
            <button
              onClick={applySphericalInput}
              className="w-full bg-accent-glow/30 hover:bg-accent-glow/50 border border-accent-primary/30 text-accent-secondary text-xs font-medium py-1.5 rounded-lg transition-all duration-200"
            >
              Apply Spherical →
            </button>
          </div>
        )}

        {inputSystem === 'cartesian' && (
          <p className="text-xs text-surface-500 italic">Use sliders above for Cartesian input.</p>
        )}
      </div>

      {/* Presets */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-surface-500">
          Presets
        </h2>
        <div className="grid grid-cols-2 gap-1.5">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              id={`preset-${preset.name.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => handlePreset(preset)}
              className="bg-surface-700/60 hover:bg-surface-600 border border-surface-600/50 hover:border-surface-500 text-surface-400 hover:text-white text-xs font-medium px-2 py-1.5 rounded-lg transition-all duration-200 text-left"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Play Animation */}
      {mode !== 'compare' && (
        <button
          id="play-animation-btn"
          onClick={onPlayAnimation}
          disabled={isAnimating}
          className={clsx(
            'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border',
            isAnimating
              ? 'bg-surface-700 border-surface-600 text-surface-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-accent-glow to-accent-primary border-accent-primary/50 text-white hover:shadow-glow-lg'
          )}
        >
          {isAnimating ? (
            <>
              <span className="animate-spin">⟳</span>
              Animating…
            </>
          ) : (
            <>
              <span>▶</span>
              Play Animation
            </>
          )}
        </button>
      )}
    </div>
  );
}
