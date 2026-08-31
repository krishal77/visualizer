import { Suspense, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

import type {
  CartesianCoords,
  CylindricalCoords,
  SphericalCoords,
  AppMode,
  AppSettings,
  DisplayMode,
  CartesianRanges,
  CylindricalRanges,
  SphericalRanges,
} from '../../types/coordinates';
import { AxesHelper } from './AxesHelper';
import { CoordinatePoint } from './CoordinatePoint';
import { ProjectionLines } from './ProjectionLines';
import { CartesianVisualization } from './CartesianVisualization';
import { CylindricalVisualization } from './CylindricalVisualization';
import { SphericalVisualization } from './SphericalVisualization';
import { SurfaceMesh } from './SurfaceMesh';

interface CoordinateSceneProps {
  position: CartesianCoords;
  cylindrical: CylindricalCoords;
  spherical: SphericalCoords;
  mode: AppMode;
  settings: AppSettings;
  animProgress: number;
  displayMode: DisplayMode;
  cartesianRanges: CartesianRanges;
  cylindricalRanges: CylindricalRanges;
  sphericalRanges: SphericalRanges;
  onResetCamera?: () => void;
}

function SceneContent({
  position,
  cylindrical,
  spherical,
  mode,
  settings,
  animProgress,
  displayMode,
  cartesianRanges,
  cylindricalRanges,
  sphericalRanges,
}: Omit<CoordinateSceneProps, 'onResetCamera'>) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={0.9} castShadow />
      <directionalLight position={[-5, 2, -5]} intensity={0.3} color="#4488ff" />
      <pointLight position={[0, 0, 0]} intensity={0.15} color="#ffffff" />

      {/* Grid */}
      {settings.showGrid && (
        <Grid
          args={[14, 14]}
          cellSize={1}
          cellThickness={0.5}
          cellColor={settings.darkMode ? '#30363d' : '#d0d7de'}
          sectionSize={5}
          sectionThickness={1}
          sectionColor={settings.darkMode ? '#484f58' : '#8c959f'}
          fadeDistance={22}
          fadeStrength={1}
          position={[0, 0, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      )}

      {/* Axes */}
      <AxesHelper showLabels={settings.showLabels} />

      {/* ── Surface mode ───────────────────────────────────────────────────── */}
      {displayMode === 'surface' && (
        <SurfaceMesh
          mode={mode}
          cartesianRanges={cartesianRanges}
          cylindricalRanges={cylindricalRanges}
          sphericalRanges={sphericalRanges}
          opacity={0.35}
          wireframe
        />
      )}

      {/* ── Point mode ─────────────────────────────────────────────────────── */}
      {displayMode === 'point' && (
        <>
          {(mode === 'cartesian' || mode === 'compare') && (
            <CartesianVisualization
              position={position}
              showProjections={settings.showProjections}
              showLabels={settings.showLabels && mode === 'cartesian'}
              animProgress={mode === 'cartesian' ? animProgress : 1}
            />
          )}

          {(mode === 'cylindrical' || mode === 'compare') && (
            <CylindricalVisualization
              position={position}
              cylindrical={cylindrical}
              showProjections={settings.showProjections}
              showAngleArcs={settings.showAngleArcs}
              showLabels={settings.showLabels && mode === 'cylindrical'}
              animProgress={mode === 'cylindrical' ? animProgress : 1}
            />
          )}

          {(mode === 'spherical' || mode === 'compare') && (
            <SphericalVisualization
              position={position}
              spherical={spherical}
              showProjections={settings.showProjections}
              showAngleArcs={settings.showAngleArcs}
              showLabels={settings.showLabels && mode === 'spherical'}
              animProgress={mode === 'spherical' ? animProgress : 1}
            />
          )}

          {mode !== 'compare' && (
            <ProjectionLines
              position={position}
              showProjections={settings.showProjections && mode === 'cartesian'}
            />
          )}

          <CoordinatePoint position={position} showLabel={settings.showLabels} />
        </>
      )}

      {/* Orbit controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        minDistance={1.5}
        maxDistance={30}
        makeDefault
      />
    </>
  );
}

export function CoordinateScene({
  position,
  cylindrical,
  spherical,
  mode,
  settings,
  animProgress,
  displayMode,
  cartesianRanges,
  cylindricalRanges,
  sphericalRanges,
  onResetCamera,
}: CoordinateSceneProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const handleResetCamera = useCallback(() => {
    if (controlsRef.current) controlsRef.current.reset();
    onResetCamera?.();
  }, [onResetCamera]);

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [6, 5, 7], fov: 50, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: false }}
        shadows
        style={{ background: settings.darkMode ? '#0d1117' : '#f6f8fa' }}
      >
        <Suspense fallback={null}>
          <SceneContent
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
        </Suspense>
      </Canvas>

      {/* Reset camera overlay */}
      <button
        id="reset-camera-btn"
        onClick={handleResetCamera}
        className="absolute bottom-4 right-4 bg-surface-700/90 hover:bg-surface-600 border border-surface-500 text-white text-xs font-medium px-3 py-2 rounded-lg backdrop-blur-sm transition-all duration-200 hover:shadow-glow flex items-center gap-2"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Reset Camera
      </button>

      {/* Mode badge */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <div className="bg-surface-800/80 border border-accent-primary/20 rounded-lg px-3 py-1.5 backdrop-blur-sm">
          <span className="text-xs font-medium text-accent-secondary capitalize">
            {mode === 'compare' ? 'Compare All' : mode}
          </span>
        </div>
        <div className={`rounded-lg px-2 py-1 backdrop-blur-sm text-xs font-medium border ${
          displayMode === 'surface'
            ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
            : 'bg-surface-800/80 border-surface-600/40 text-surface-400'
        }`}>
          {displayMode === 'surface' ? '◈ Surface' : '◉ Point'}
        </div>
      </div>
    </div>
  );
}
