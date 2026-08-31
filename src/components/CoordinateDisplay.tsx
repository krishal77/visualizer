import type { CartesianCoords, CylindricalCoords, SphericalCoords, AppMode } from '../types/coordinates';
import { fmt, toDeg } from '../utils/coordinateConversions';
import { clsx } from 'clsx';

interface CoordinateDisplayProps {
  position: CartesianCoords;
  cylindrical: CylindricalCoords;
  spherical: SphericalCoords;
  mode: AppMode;
}

interface CoordRowProps {
  symbol: string;
  value: string;
  symbolColor: string;
  description?: string;
}

function CoordRow({ symbol, value, symbolColor, description }: CoordRowProps) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-surface-700/50 last:border-0">
      <div className="flex items-center gap-2">
        <span className={clsx('font-mono font-bold text-sm w-6 text-center', symbolColor)}>
          {symbol}
        </span>
        {description && (
          <span className="text-xs text-surface-500">{description}</span>
        )}
      </div>
      <span className="font-mono text-sm text-white">{value}</span>
    </div>
  );
}

interface SectionProps {
  title: string;
  titleColor: string;
  notation: string;
  isActive: boolean;
  children: React.ReactNode;
}

function Section({ title, titleColor, notation, isActive, children }: SectionProps) {
  return (
    <div className={clsx(
      'rounded-xl border p-4 transition-all duration-300',
      isActive
        ? 'bg-surface-700/50 border-accent-primary/30 shadow-glow'
        : 'bg-surface-800/50 border-surface-700/50'
    )}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={clsx('text-sm font-bold', isActive ? titleColor : 'text-surface-400')}>
          {title}
        </h3>
        <span className="text-xs font-mono text-surface-500">{notation}</span>
      </div>
      {children}
    </div>
  );
}

export function CoordinateDisplay({ position, cylindrical, spherical, mode }: CoordinateDisplayProps) {
  const { x, y, z } = position;
  const { r, theta: cylTheta, z: cylZ } = cylindrical;
  const { rho, theta: sphTheta, phi } = spherical;

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-surface-500">
        Current Coordinates
      </h2>

      {/* Cartesian */}
      <Section
        title="Cartesian"
        titleColor="text-red-400"
        notation="P(x, y, z)"
        isActive={mode === 'cartesian' || mode === 'compare'}
      >
        <CoordRow symbol="x" symbolColor="text-red-400" value={fmt(x)} description="along X-axis" />
        <CoordRow symbol="y" symbolColor="text-green-400" value={fmt(y)} description="along Y-axis" />
        <CoordRow symbol="z" symbolColor="text-blue-400" value={fmt(z)} description="along Z-axis" />
      </Section>

      {/* Cylindrical */}
      <Section
        title="Cylindrical"
        titleColor="text-orange-400"
        notation="P(r, θ, z)"
        isActive={mode === 'cylindrical' || mode === 'compare'}
      >
        <CoordRow symbol="r" symbolColor="text-orange-400" value={fmt(r)} description="radial distance" />
        <CoordRow symbol="θ" symbolColor="text-purple-400" value={`${fmt(toDeg(cylTheta))}°`} description="azimuth angle" />
        <CoordRow symbol="z" symbolColor="text-blue-400" value={fmt(cylZ)} description="height" />
      </Section>

      {/* Spherical */}
      <Section
        title="Spherical"
        titleColor="text-teal-400"
        notation="P(ρ, θ, φ)"
        isActive={mode === 'spherical' || mode === 'compare'}
      >
        <CoordRow symbol="ρ" symbolColor="text-teal-400" value={fmt(rho)} description="distance from origin" />
        <CoordRow symbol="θ" symbolColor="text-purple-400" value={`${fmt(toDeg(sphTheta))}°`} description="azimuth angle" />
        <CoordRow symbol="φ" symbolColor="text-pink-400" value={`${fmt(toDeg(phi))}°`} description="polar angle from +Z" />
      </Section>
    </div>
  );
}
