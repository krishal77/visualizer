import { useMemo } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { CartesianCoords, SphericalCoords } from '../../types/coordinates';
import { fmt, toDeg } from '../../utils/coordinateConversions';
import { arcPointsXY, arcPointsSphericalPhi, pointsToGeometry } from '../../utils/geometry';
import { EPSILON } from '../../types/coordinates';

interface SphericalVisualizationProps {
  position: CartesianCoords;
  spherical: SphericalCoords;
  showProjections: boolean;
  showAngleArcs: boolean;
  showLabels: boolean;
  animProgress?: number;
}

function Line({
  from,
  to,
  color,
  opacity = 0.8,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  color: string;
  opacity?: number;
}) {
  const geo = useMemo(
    () => pointsToGeometry([from, to]),
    [from.x, from.y, from.z, to.x, to.y, to.z] // eslint-disable-line
  );
  return (
    <line>
      <primitive object={geo} attach="geometry" />
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </line>
  );
}

export function SphericalVisualization({
  position,
  spherical,
  showProjections,
  showAngleArcs,
  showLabels,
  animProgress = 1,
}: SphericalVisualizationProps) {
  const { rho, theta, phi } = spherical;

  // Animation stages:
  // 0→0.4: grow rho line
  // 0.4→0.7: sweep theta arc in XY
  // 0.7→1: show phi arc from Z axis
  const t = animProgress;
  const rhoProgress = Math.min(1, t / 0.4);
  const thetaProgress = Math.min(1, Math.max(0, (t - 0.4) / 0.3));
  const phiProgress = Math.min(1, Math.max(0, (t - 0.7) / 0.3));

  const p = new THREE.Vector3(position.x, position.y, position.z);
  const origin = new THREE.Vector3(0, 0, 0);
  const xyProj = new THREE.Vector3(position.x, position.y, 0);

  // Animated point along rho
  const rhoEnd = useMemo(() => {
    return new THREE.Vector3(
      position.x * rhoProgress,
      position.y * rhoProgress,
      position.z * rhoProgress
    );
  }, [position, rhoProgress]);

  // Theta arc in XY plane
  const thetaArcGeo = useMemo(() => {
    if (rho < EPSILON) return null;
    const rXY = Math.sqrt(position.x ** 2 + position.y ** 2);
    const arcR = Math.min(rXY * 0.5, 0.7);
    if (arcR < 0.05) return null;
    const pts = arcPointsXY(arcR, 0, theta * thetaProgress, 48);
    return pointsToGeometry(pts);
  }, [rho, theta, thetaProgress, position]);

  // Phi arc from Z axis in the vertical plane
  const phiArcGeo = useMemo(() => {
    if (rho < EPSILON) return null;
    const arcR = rho * 0.35;
    const pts = arcPointsSphericalPhi(arcR, theta, 0, phi * phiProgress, 48);
    return pointsToGeometry(pts);
  }, [rho, theta, phi, phiProgress]);

  // Reference line along +Z for phi arc start
  const zRefGeo = useMemo(() => {
    if (rho < EPSILON) return null;
    const arcR = rho * 0.35;
    return pointsToGeometry([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, arcR),
    ]);
  }, [rho]);

  // Reference line along XY direction for theta arc
  const xyRefGeo = useMemo(() => {
    if (rho < EPSILON) return null;
    const rXY = Math.sqrt(position.x ** 2 + position.y ** 2);
    const arcR = Math.min(rXY * 0.5, 0.7);
    if (arcR < 0.05) return null;
    return pointsToGeometry([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(arcR, 0, 0),
    ]);
  }, [rho, position]);

  // Label positions
  const thetaLabelPos = useMemo(() => {
    const rXY = Math.sqrt(position.x ** 2 + position.y ** 2);
    const arcR = Math.min(rXY * 0.5, 0.7) + 0.25;
    const midAngle = theta / 2;
    return new THREE.Vector3(arcR * Math.cos(midAngle), arcR * Math.sin(midAngle), 0);
  }, [theta, position]);

  const phiLabelPos = useMemo(() => {
    const arcR = rho * 0.35 + 0.25;
    const midPhi = phi / 2;
    return new THREE.Vector3(
      arcR * Math.sin(midPhi) * Math.cos(theta),
      arcR * Math.sin(midPhi) * Math.sin(theta),
      arcR * Math.cos(midPhi)
    );
  }, [rho, theta, phi]);

  return (
    <group>
      {/* Rho line: origin → point */}
      <Line from={origin} to={rhoEnd} color="#44ffcc" opacity={0.95} />

      {/* XY projection line (dashed style) */}
      {showProjections && (
        <>
          <Line from={p} to={xyProj} color="#888888" opacity={0.35} />
          <Line from={origin} to={xyProj} color="#ff9933" opacity={0.4} />
        </>
      )}

      {/* Theta arc in XY plane */}
      {showAngleArcs && thetaArcGeo && (
        <>
          <line>
            <primitive object={thetaArcGeo} attach="geometry" />
            <lineBasicMaterial color="#cc44ff" transparent opacity={0.9} />
          </line>
          {xyRefGeo && (
            <line>
              <primitive object={xyRefGeo} attach="geometry" />
              <lineBasicMaterial color="#cc44ff" transparent opacity={0.4} />
            </line>
          )}
        </>
      )}

      {/* Phi arc from +Z */}
      {showAngleArcs && phiArcGeo && phiProgress > 0.01 && (
        <>
          <line>
            <primitive object={phiArcGeo} attach="geometry" />
            <lineBasicMaterial color="#ff44cc" transparent opacity={0.9} />
          </line>
          {zRefGeo && (
            <line>
              <primitive object={zRefGeo} attach="geometry" />
              <lineBasicMaterial color="#ff44cc" transparent opacity={0.4} />
            </line>
          )}
        </>
      )}

      {/* XY projection dot */}
      {showProjections && (
        <mesh position={xyProj}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshStandardMaterial color="#ff9933" />
        </mesh>
      )}

      {/* Labels */}
      {showLabels && (
        <>
          {/* rho label at midpoint */}
          <Html
            position={[p.x / 2 + 0.2, p.y / 2, p.z / 2 + 0.2]}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            <div className="text-xs font-mono font-bold text-teal-400 bg-surface-800/80 px-1 rounded">
              ρ = {fmt(rho)}
            </div>
          </Html>

          {/* theta label */}
          {rho > EPSILON && showAngleArcs && (
            <Html
              position={[thetaLabelPos.x, thetaLabelPos.y + 0.2, 0]}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              <div className="text-xs font-mono font-bold text-purple-400 bg-surface-800/80 px-1 rounded">
                θ = {toDeg(theta)}°
              </div>
            </Html>
          )}

          {/* phi label */}
          {rho > EPSILON && showAngleArcs && phi > EPSILON && (
            <Html
              position={[phiLabelPos.x, phiLabelPos.y, phiLabelPos.z + 0.2]}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              <div className="text-xs font-mono font-bold text-pink-400 bg-surface-800/80 px-1 rounded">
                φ = {toDeg(phi)}°
              </div>
            </Html>
          )}
        </>
      )}
    </group>
  );
}
