import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  CartesianCoords,
  AppMode,
  AppSettings,
  DisplayMode,
  CartesianRanges,
  CylindricalRanges,
  SphericalRanges,
} from './types/coordinates';
import {
  cartesianToCylindrical,
  cartesianToSpherical,
  toRad,
} from './utils/coordinateConversions';
import { CoordinateScene } from './components/visualization/CoordinateScene';
import { CoordinateSelector } from './components/CoordinateSelector';
import { CoordinateControls } from './components/CoordinateControls';
import { CoordinateDisplay } from './components/CoordinateDisplay';
import { FormulaPanel } from './components/FormulaPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { SurfaceRangeControls } from './components/SurfaceRangeControls';
import { EMLabPage } from './em-lab/EMLabPage';
import { clsx } from 'clsx';

type ActiveModule = 'coordinates' | 'emlab';

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_POSITION: CartesianCoords = { x: 3, y: 4, z: 5 };

const DEFAULT_SETTINGS: AppSettings = {
  showGrid: true,
  showProjections: true,
  showAngleArcs: true,
  showLabels: true,
  showCoordPlanes: false,
  darkMode: true,
};

const DEFAULT_CARTESIAN_RANGES: CartesianRanges = {
  x: { min: -2, max: 2 },
  y: { min: -2, max: 2 },
  z: { min: 0, max: 3 },
};

const DEFAULT_CYLINDRICAL_RANGES: CylindricalRanges = {
  r:     { min: 0, max: 2 },
  theta: { min: toRad(0), max: toRad(360) },
  z:     { min: 0, max: 3 },
};

const DEFAULT_SPHERICAL_RANGES: SphericalRanges = {
  rho:   { min: 0, max: 2 },
  theta: { min: toRad(0), max: toRad(360) },
  phi:   { min: toRad(0), max: toRad(180) },
};

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('coordinates');
  const [position, setPosition] = useState<CartesianCoords>(DEFAULT_POSITION);
  const [mode, setMode] = useState<AppMode>('cartesian');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('point');

  // Surface ranges
  const [cartesianRanges, setCartesianRanges] = useState<CartesianRanges>(DEFAULT_CARTESIAN_RANGES);
  const [cylindricalRanges, setCylindricalRanges] = useState<CylindricalRanges>(DEFAULT_CYLINDRICAL_RANGES);
  const [sphericalRanges, setSphericalRanges] = useState<SphericalRanges>(DEFAULT_SPHERICAL_RANGES);

  // Animation
  const [animProgress, setAnimProgress] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const animFrameRef = useRef<number | null>(null);
  const animStartRef = useRef<number | null>(null);
  const ANIM_DURATION = 2500;

  // Derived coordinates
  const cylindrical = cartesianToCylindrical(position);
  const spherical = cartesianToSpherical(position);

  // Sync dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode);
  }, [settings.darkMode]);

  // ── Animation ──────────────────────────────────────────────────────────────
  const handlePlayAnimation = useCallback(() => {
    if (isAnimating) return;
    setAnimProgress(0);
    setIsAnimating(true);
    animStartRef.current = null;

    const animate = (timestamp: number) => {
      if (!animStartRef.current) animStartRef.current = timestamp;
      const elapsed = timestamp - animStartRef.current;
      const progress = Math.min(1, elapsed / ANIM_DURATION);
      setAnimProgress(progress);
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        setAnimProgress(1);
      }
    };
    animFrameRef.current = requestAnimationFrame(animate);
  }, [isAnimating]);

  useEffect(() => () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); }, []);
  useEffect(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setIsAnimating(false);
    setAnimProgress(1);
  }, [mode]);

  // ── Layout ─────────────────────────────────────────────────────────────────
  return (
    <div className={clsx(
      'h-screen flex flex-col font-sans overflow-hidden',
      settings.darkMode ? 'bg-surface-900 text-white' : 'bg-gray-50 text-gray-900'
    )}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className={clsx(
        'flex-shrink-0 flex items-center justify-between px-6 py-3 border-b z-10',
        settings.darkMode
          ? 'bg-surface-800/95 border-surface-700 backdrop-blur-sm'
          : 'bg-white border-gray-200 shadow-sm'
      )}>
        <div className="flex items-center gap-3">
          {/* Module switcher */}
          <div className="flex items-center gap-1 bg-surface-700/50 p-1 rounded-xl border border-surface-600/30">
            <button
              id="module-coordinates"
              onClick={() => setActiveModule('coordinates')}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5',
                activeModule === 'coordinates'
                  ? 'bg-accent-glow/30 text-white border border-accent-primary/40'
                  : 'text-surface-500 hover:text-white'
              )}
            >
              <span className="text-[10px]">🔷</span> Coordinates
            </button>
            <button
              id="module-emlab"
              onClick={() => setActiveModule('emlab')}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5',
                activeModule === 'emlab'
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                  : 'text-surface-500 hover:text-white'
              )}
            >
              <span className="text-[10px]">⚡</span> EM Lab
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode selector */}
          <div className="hidden lg:flex items-center gap-1 bg-surface-700/50 p-1 rounded-xl">
            {(['cartesian', 'cylindrical', 'spherical', 'compare'] as AppMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                  mode === m
                    ? 'bg-accent-glow/30 text-white border border-accent-primary/40'
                    : 'text-surface-500 hover:text-white'
                )}
              >
                {m === 'compare' ? 'Compare All' : m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>

          {/* Point / Surface toggle */}
          <div className="flex items-center gap-1 bg-surface-700/50 p-1 rounded-xl border border-surface-600/40">
            <button
              id="mode-point"
              onClick={() => setDisplayMode('point')}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5',
                displayMode === 'point'
                  ? 'bg-accent-glow/30 text-white border border-accent-primary/40'
                  : 'text-surface-500 hover:text-white'
              )}
            >
              ◉ Point
            </button>
            <button
              id="mode-surface"
              onClick={() => setDisplayMode('surface')}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5',
                displayMode === 'surface'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'text-surface-500 hover:text-white'
              )}
            >
              ◈ Surface
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* EM Lab module */}
        {activeModule === 'emlab' && <EMLabPage />}

        {/* ── Coordinate Systems module ─────────────────────────────────── */}
        {activeModule === 'coordinates' && (
          <>
        {/* ── Left Panel ─────────────────────────────────────────────────── */}
        <aside className={clsx(
          'w-72 flex-shrink-0 flex flex-col border-r overflow-y-auto',
          settings.darkMode ? 'bg-surface-800/50 border-surface-700' : 'bg-white border-gray-200'
        )}>
          <div className="p-4 space-y-6">
            <CoordinateSelector mode={mode} onChange={setMode} />

            <div className="border-t border-surface-700/50" />

            {/* Show point controls or surface range controls based on displayMode */}
            {displayMode === 'point' ? (
              <CoordinateControls
                position={position}
                cylindrical={cylindrical}
                spherical={spherical}
                mode={mode}
                onPositionChange={setPosition}
                onPlayAnimation={handlePlayAnimation}
                isAnimating={isAnimating}
              />
            ) : (
              <SurfaceRangeControls
                mode={mode}
                cartesianRanges={cartesianRanges}
                cylindricalRanges={cylindricalRanges}
                sphericalRanges={sphericalRanges}
                onCartesianChange={setCartesianRanges}
                onCylindricalChange={setCylindricalRanges}
                onSphericalChange={setSphericalRanges}
              />
            )}

            <div className="border-t border-surface-700/50" />

            <SettingsPanel settings={settings} onChange={setSettings} />
          </div>
        </aside>

        {/* ── Center: 3D Canvas ───────────────────────────────────────────── */}
        <main className="flex-1 relative overflow-hidden">
          <CoordinateScene
            position={position}
            cylindrical={cylindrical}
            spherical={spherical}
            mode={mode}
            settings={settings}
            animProgress={animProgress}
            displayMode={displayMode}
            cartesianRanges={cartesianRanges}
            cylindricalRanges={cylindricalRanges}
            sphericalRanges={sphericalRanges}
          />
        </main>

        {/* ── Right Panel ─────────────────────────────────────────────────── */}
        <aside className={clsx(
          'w-80 flex-shrink-0 flex flex-col border-l overflow-y-auto',
          settings.darkMode ? 'bg-surface-800/50 border-surface-700' : 'bg-white border-gray-200'
        )}>
          <div className="p-4 space-y-6">
            {displayMode === 'point' ? (
              <>
                <CoordinateDisplay
                  position={position}
                  cylindrical={cylindrical}
                  spherical={spherical}
                  mode={mode}
                />
                <div className="border-t border-surface-700/50" />
                <FormulaPanel
                  mode={mode}
                  position={position}
                  cylindrical={cylindrical}
                  spherical={spherical}
                />
              </>
            ) : (
              <SurfaceRangeSummary
                mode={mode}
                cartesianRanges={cartesianRanges}
                cylindricalRanges={cylindricalRanges}
                sphericalRanges={sphericalRanges}
              />
            )}
          </div>
        </aside>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Right-panel summary for surface mode ─────────────────────────────────────

import { toDeg, fmt } from './utils/coordinateConversions';

function SurfaceRangeSummary({
  mode,
  cartesianRanges,
  cylindricalRanges,
  sphericalRanges,
}: {
  mode: AppMode;
  cartesianRanges: CartesianRanges;
  cylindricalRanges: CylindricalRanges;
  sphericalRanges: SphericalRanges;
}) {
  const showCart = mode === 'cartesian' || mode === 'compare';
  const showCyl  = mode === 'cylindrical' || mode === 'compare';
  const showSph  = mode === 'spherical' || mode === 'compare';

  const row = (label: string, color: string, min: string, max: string) => (
    <div key={label} className="flex items-center justify-between py-1.5 border-b border-surface-700/50 last:border-0">
      <span className={clsx('font-mono font-bold text-sm w-10', color)}>{label}</span>
      <span className="font-mono text-xs text-white">
        [{min}, {max}]
      </span>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-surface-500">
        Active Ranges
      </h2>

      {showCart && (
        <div className="bg-surface-700/40 rounded-xl border border-red-500/20 p-4">
          <h3 className="text-xs font-bold text-red-400 mb-3">Cartesian</h3>
          {row('x', 'text-red-400', fmt(cartesianRanges.x.min), fmt(cartesianRanges.x.max))}
          {row('y', 'text-green-400', fmt(cartesianRanges.y.min), fmt(cartesianRanges.y.max))}
          {row('z', 'text-blue-400', fmt(cartesianRanges.z.min), fmt(cartesianRanges.z.max))}
        </div>
      )}

      {showCyl && (
        <div className="bg-surface-700/40 rounded-xl border border-orange-500/20 p-4">
          <h3 className="text-xs font-bold text-orange-400 mb-3">Cylindrical</h3>
          {row('r', 'text-orange-400', fmt(cylindricalRanges.r.min), fmt(cylindricalRanges.r.max))}
          {row('θ', 'text-purple-400',
            `${toDeg(cylindricalRanges.theta.min)}°`,
            `${toDeg(cylindricalRanges.theta.max)}°`
          )}
          {row('z', 'text-blue-400', fmt(cylindricalRanges.z.min), fmt(cylindricalRanges.z.max))}

          {/* Volume hint */}
          <div className="mt-3 pt-3 border-t border-surface-700/50 space-y-1">
            <p className="text-xs text-surface-500 font-semibold uppercase tracking-wider mb-1">Shape Info</p>
            <p className="text-xs text-surface-400">
              {cylindricalRanges.r.min < 0.01
                ? 'Solid cylinder'
                : 'Hollow cylindrical shell'}
              {Math.abs(toDeg(cylindricalRanges.theta.max) - toDeg(cylindricalRanges.theta.min)) < 359
                ? ' wedge'
                : ''}
            </p>
          </div>
        </div>
      )}

      {showSph && (
        <div className="bg-surface-700/40 rounded-xl border border-teal-500/20 p-4">
          <h3 className="text-xs font-bold text-teal-400 mb-3">Spherical</h3>
          {row('ρ', 'text-teal-400', fmt(sphericalRanges.rho.min), fmt(sphericalRanges.rho.max))}
          {row('θ', 'text-purple-400',
            `${toDeg(sphericalRanges.theta.min)}°`,
            `${toDeg(sphericalRanges.theta.max)}°`
          )}
          {row('φ', 'text-pink-400',
            `${toDeg(sphericalRanges.phi.min)}°`,
            `${toDeg(sphericalRanges.phi.max)}°`
          )}

          <div className="mt-3 pt-3 border-t border-surface-700/50 space-y-1">
            <p className="text-xs text-surface-500 font-semibold uppercase tracking-wider mb-1">Shape Info</p>
            <p className="text-xs text-surface-400">
              {sphericalRanges.rho.min < 0.01 ? 'Solid sphere' : 'Spherical shell'}
              {Math.abs(toDeg(sphericalRanges.theta.max) - toDeg(sphericalRanges.theta.min)) < 359
                ? ' wedge' : ''}
              {(toDeg(sphericalRanges.phi.max) - toDeg(sphericalRanges.phi.min)) < 179
                ? ' cap' : ''}
            </p>
          </div>
        </div>
      )}

      <div className="bg-surface-800/60 rounded-xl border border-surface-700/50 p-3">
        <p className="text-xs text-surface-400 leading-relaxed">
          <span className="text-accent-secondary font-semibold">Tip:</span> Change any range value
          and the 3D surface updates instantly. Switch back to <span className="text-white font-medium">◉ Point</span> mode
          to place an individual point.
        </p>
      </div>
    </div>
  );
}
