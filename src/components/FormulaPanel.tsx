import { useState } from 'react';
import type { CartesianCoords, CylindricalCoords, SphericalCoords, AppMode } from '../types/coordinates';
import { fmt, toDeg } from '../utils/coordinateConversions';
import { clsx } from 'clsx';

interface FormulaPanelProps {
  mode: AppMode;
  position: CartesianCoords;
  cylindrical: CylindricalCoords;
  spherical: SphericalCoords;
}

interface FormulaLineProps {
  lhs: string;
  rhs: string;
  lhsColor?: string;
}

function FormulaLine({ lhs, rhs, lhsColor = 'text-accent-secondary' }: FormulaLineProps) {
  return (
    <div className="flex items-baseline gap-2 py-0.5">
      <span className={clsx('font-mono font-bold text-xs w-20', lhsColor)}>{lhs}</span>
      <span className="text-surface-500 text-xs">=</span>
      <span className="font-mono text-xs text-white">{rhs}</span>
    </div>
  );
}

interface ExplanationCardProps {
  symbol: string;
  symbolColor: string;
  name: string;
  geometric: string;
  how: string;
}

function ExplanationCard({ symbol, symbolColor, name, geometric, how }: ExplanationCardProps) {
  return (
    <div className="bg-surface-700/40 rounded-lg p-3 border border-surface-600/30">
      <div className="flex items-center gap-2 mb-1.5">
        <span className={clsx('font-mono font-bold text-sm', symbolColor)}>{symbol}</span>
        <span className="text-xs font-semibold text-white">{name}</span>
      </div>
      <p className="text-xs text-surface-400 leading-relaxed">{geometric}</p>
      <p className="text-xs text-surface-500 mt-1 italic">{how}</p>
    </div>
  );
}

export function FormulaPanel({ mode, position, cylindrical, spherical }: FormulaPanelProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const { x, y, z } = position;
  const { r, theta: ct, z: cz } = cylindrical;
  const { rho, theta: st, phi } = spherical;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-surface-500">
          Formulas
        </h2>
        <button
          id="toggle-explanation"
          onClick={() => setShowExplanation((p) => !p)}
          className="text-xs text-accent-primary hover:text-accent-secondary transition-colors font-medium"
        >
          {showExplanation ? '− Explanation' : '+ Explanation'}
        </button>
      </div>

      {/* ── Cartesian ───────────────────────────────────── */}
      {(mode === 'cartesian' || mode === 'compare') && (
        <div className="bg-surface-800/60 rounded-xl border border-surface-700/50 p-4 space-y-2">
          <h3 className="text-xs font-bold text-red-400 mb-2">Cartesian P(x, y, z)</h3>
          <FormulaLine lhs="x" rhs={fmt(x)} lhsColor="text-red-400" />
          <FormulaLine lhs="y" rhs={fmt(y)} lhsColor="text-green-400" />
          <FormulaLine lhs="z" rhs={fmt(z)} lhsColor="text-blue-400" />

          {showExplanation && (
            <div className="mt-3 space-y-2 pt-3 border-t border-surface-700/50">
              <ExplanationCard
                symbol="x" symbolColor="text-red-400"
                name="X coordinate"
                geometric="Signed distance from the YZ plane along the X-axis."
                how="Measured horizontally east/west from the origin."
              />
              <ExplanationCard
                symbol="y" symbolColor="text-green-400"
                name="Y coordinate"
                geometric="Signed distance from the XZ plane along the Y-axis."
                how="Measured horizontally north/south from the origin."
              />
              <ExplanationCard
                symbol="z" symbolColor="text-blue-400"
                name="Z coordinate"
                geometric="Signed distance from the XY plane along the Z-axis."
                how="Measured vertically up/down from the origin."
              />
            </div>
          )}
        </div>
      )}

      {/* ── Cylindrical ─────────────────────────────────── */}
      {(mode === 'cylindrical' || mode === 'compare') && (
        <div className="bg-surface-800/60 rounded-xl border border-surface-700/50 p-4 space-y-2">
          <h3 className="text-xs font-bold text-orange-400 mb-2">Cylindrical P(r, θ, z)</h3>
          <p className="text-xs text-surface-500 mb-2">From Cartesian:</p>
          <FormulaLine lhs="r" rhs={`√(x²+y²)  = ${fmt(r)}`} lhsColor="text-orange-400" />
          <FormulaLine lhs="θ" rhs={`atan2(y,x) = ${fmt(toDeg(ct))}°`} lhsColor="text-purple-400" />
          <FormulaLine lhs="z" rhs={`z         = ${fmt(cz)}`} lhsColor="text-blue-400" />
          <div className="border-t border-surface-700/50 pt-2 mt-2">
            <p className="text-xs text-surface-500 mb-2">To Cartesian:</p>
            <FormulaLine lhs="x = r·cos(θ)" rhs={`${fmt(r)}·cos(${fmt(toDeg(ct))}°) = ${fmt(x)}`} lhsColor="text-red-400" />
            <FormulaLine lhs="y = r·sin(θ)" rhs={`${fmt(r)}·sin(${fmt(toDeg(ct))}°) = ${fmt(y)}`} lhsColor="text-green-400" />
          </div>

          {showExplanation && (
            <div className="mt-3 space-y-2 pt-3 border-t border-surface-700/50">
              <ExplanationCard
                symbol="r" symbolColor="text-orange-400"
                name="Radial distance"
                geometric="Distance from the Z-axis (not the origin)."
                how="Length of the horizontal shadow of the point projected onto the XY plane."
              />
              <ExplanationCard
                symbol="θ" symbolColor="text-purple-400"
                name="Azimuth angle"
                geometric="Angle swept counter-clockwise from the +X axis in the XY plane."
                how="Range: [0°, 360°). Related to compass bearing."
              />
              <ExplanationCard
                symbol="z" symbolColor="text-blue-400"
                name="Height"
                geometric="Same as the Cartesian z coordinate."
                how="Vertical distance above/below the XY plane."
              />
            </div>
          )}
        </div>
      )}

      {/* ── Spherical ───────────────────────────────────── */}
      {(mode === 'spherical' || mode === 'compare') && (
        <div className="bg-surface-800/60 rounded-xl border border-surface-700/50 p-4 space-y-2">
          <h3 className="text-xs font-bold text-teal-400 mb-1">Spherical P(ρ, θ, φ)</h3>
          <p className="text-xs text-purple-300/70 mb-2 italic">
            Convention: φ measured from +Z axis (physics/math ISO 80000-2)
          </p>
          <p className="text-xs text-surface-500 mb-2">From Cartesian:</p>
          <FormulaLine lhs="ρ" rhs={`√(x²+y²+z²) = ${fmt(rho)}`} lhsColor="text-teal-400" />
          <FormulaLine lhs="θ" rhs={`atan2(y,x)   = ${fmt(toDeg(st))}°`} lhsColor="text-purple-400" />
          <FormulaLine lhs="φ" rhs={`arccos(z/ρ)  = ${fmt(toDeg(phi))}°`} lhsColor="text-pink-400" />
          <div className="border-t border-surface-700/50 pt-2 mt-2">
            <p className="text-xs text-surface-500 mb-2">To Cartesian:</p>
            <FormulaLine lhs="x = ρ sin(φ) cos(θ)" rhs={`= ${fmt(x)}`} lhsColor="text-red-400" />
            <FormulaLine lhs="y = ρ sin(φ) sin(θ)" rhs={`= ${fmt(y)}`} lhsColor="text-green-400" />
            <FormulaLine lhs="z = ρ cos(φ)" rhs={`= ${fmt(z)}`} lhsColor="text-blue-400" />
          </div>

          {showExplanation && (
            <div className="mt-3 space-y-2 pt-3 border-t border-surface-700/50">
              <ExplanationCard
                symbol="ρ" symbolColor="text-teal-400"
                name="Radial distance"
                geometric="Distance from the origin to the point."
                how="Length of the 3D vector from origin to point."
              />
              <ExplanationCard
                symbol="θ" symbolColor="text-purple-400"
                name="Azimuth angle"
                geometric="Angle swept counter-clockwise from +X axis in the XY plane."
                how="Same as cylindrical θ. Range [0°, 360°)."
              />
              <ExplanationCard
                symbol="φ" symbolColor="text-pink-400"
                name="Polar angle"
                geometric="Angle from the +Z axis down to the radial line."
                how="φ=0° is the north pole (+Z), φ=90° is the equator, φ=180° is the south pole (−Z)."
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
