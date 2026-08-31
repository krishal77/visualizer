import { useMemo } from 'react';
import * as THREE from 'three';
import type { AppMode, CartesianRanges, CylindricalRanges, SphericalRanges } from '../../types/coordinates';
import {
  generateCartesianGeometry,
  generateCylindricalGeometry,
  generateSphericalGeometry,
} from '../../utils/surfaceGeometry';

interface SurfaceMeshProps {
  mode: AppMode;
  cartesianRanges: CartesianRanges;
  cylindricalRanges: CylindricalRanges;
  sphericalRanges: SphericalRanges;
  opacity?: number;
  color?: string;
  wireframe?: boolean;
}

/** Returns color + wireframe color for each mode */
function modeColors(mode: AppMode): { solid: string; wire: string } {
  switch (mode) {
    case 'cartesian':  return { solid: '#ff6677', wire: '#ff4444' };
    case 'cylindrical': return { solid: '#ffaa44', wire: '#ff9933' };
    case 'spherical':  return { solid: '#44ffcc', wire: '#22ddaa' };
    default:           return { solid: '#7788ff', wire: '#5566ff' };
  }
}

export function SurfaceMesh({
  mode,
  cartesianRanges,
  cylindricalRanges,
  sphericalRanges,
  opacity = 0.35,
  wireframe = true,
}: SurfaceMeshProps) {
  const { solid, wire } = modeColors(mode);

  // Recompute geometry only when relevant ranges change
  const geometry = useMemo(() => {
    try {
      if (mode === 'cartesian') {
        return generateCartesianGeometry(cartesianRanges);
      } else if (mode === 'cylindrical') {
        return generateCylindricalGeometry(cylindricalRanges);
      } else if (mode === 'spherical') {
        return generateSphericalGeometry(sphericalRanges);
      } else {
        // Compare mode: show all three — just return a basic marker
        return null;
      }
    } catch {
      return null;
    }
  }, [mode, cartesianRanges, cylindricalRanges, sphericalRanges]);

  // In compare mode, show all three simultaneously
  const cartGeo = useMemo(() => {
    if (mode !== 'compare') return null;
    try { return generateCartesianGeometry(cartesianRanges); } catch { return null; }
  }, [mode, cartesianRanges]);

  const cylGeo = useMemo(() => {
    if (mode !== 'compare') return null;
    try { return generateCylindricalGeometry(cylindricalRanges); } catch { return null; }
  }, [mode, cylindricalRanges]);

  const sphGeo = useMemo(() => {
    if (mode !== 'compare') return null;
    try { return generateSphericalGeometry(sphericalRanges); } catch { return null; }
  }, [mode, sphericalRanges]);

  if (mode === 'compare') {
    const compareGeos: { geo: THREE.BufferGeometry | null; solidColor: string; wireColor: string }[] = [
      { geo: cartGeo, solidColor: '#ff6677', wireColor: '#ff4444' },
      { geo: cylGeo,  solidColor: '#ffaa44', wireColor: '#ff9933' },
      { geo: sphGeo,  solidColor: '#44ffcc', wireColor: '#22ddaa' },
    ];
    return (
      <group>
        {compareGeos.map(({ geo, solidColor, wireColor }, i) =>
          geo ? (
            <group key={i}>
              <mesh geometry={geo}>
                <meshPhongMaterial
                  color={solidColor}
                  transparent
                  opacity={0.22}
                  side={THREE.DoubleSide}
                  depthWrite={false}
                />
              </mesh>
              {wireframe && (
                <mesh geometry={geo}>
                  <meshBasicMaterial
                    color={wireColor}
                    wireframe
                    transparent
                    opacity={0.5}
                  />
                </mesh>
              )}
            </group>
          ) : null
        )}
      </group>
    );
  }

  if (!geometry) return null;

  return (
    <group>
      {/* Solid fill — semi-transparent, double-sided */}
      <mesh geometry={geometry}>
        <meshPhongMaterial
          color={solid}
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
          shininess={60}
          specular="#ffffff"
          depthWrite={false}
        />
      </mesh>

      {/* Wireframe overlay — makes structure visible */}
      {wireframe && (
        <mesh geometry={geometry}>
          <meshBasicMaterial
            color={wire}
            wireframe
            transparent
            opacity={0.55}
          />
        </mesh>
      )}
    </group>
  );
}
