import { useMemo } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { CartesianCoords, CylindricalCoords } from '../../types/coordinates';
import { fmt, toDeg } from '../../utils/coordinateConversions';
import { arcPointsXY, pointsToGeometry } from '../../utils/geometry';
import { AngleArc } from './AngleArc';
import { EPSILON } from '../../types/coordinates';

interface CylindricalVisualizationProps {
  position: CartesianCoords;
  cylindrical: CylindricalCoords;
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

export function CylindricalVisualization({
  position,
  cylindrical,
  showProjections,
  showAngleArcs,
  showLabels,
  animProgress = 1,
}: CylindricalVisualizationProps) {
  const { r, theta, z } = cylindrical;

  // Animation stages: 0-0.33 → draw r, 0.33-0.67 → draw arc, 0.67-1 → lift z
  const t = animProgress;
  const rProgress = Math.min(1, t / 0.33);
  const arcProgress = Math.min(1, Math.max(0, (t - 0.33) / 0.34));
  const zProgress = Math.min(1, Math.max(0, (t - 0.67) / 0.33));

  const p = new THREE.Vector3(position.x, position.y, position.z);
  const origin = new THREE.Vector3(0, 0, 0);
  const xyProj = new THREE.Vector3(position.x * rProgress, position.y * rProgress, 0);
  const pointFinal = new THREE.Vector3(position.x, position.y, position.z * zProgress);

  // Arc geometry for theta (from 0 to theta in XY plane)
  const arcGeo = useMemo(() => {
    if (r < EPSILON) return null;
    const arcRadius = Math.min(r * 0.4, 0.8);
    const pts = arcPointsXY(arcRadius, 0, theta * arcProgress, 48);
    return pointsToGeometry(pts);
  }, [r, theta, arcProgress]);

  // Small reference line at angle=0 for arc start
  const arcRefGeo = useMemo(() => {
    if (r < EPSILON) return null;
    const arcRadius = Math.min(r * 0.4, 0.8);
    return pointsToGeometry([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(arcRadius, 0, 0),
    ]);
  }, [r]);

  // Cylinder wireframe circle in XY plane
  const circleGeo = useMemo(() => {
    if (r < EPSILON) return null;
    const pts = arcPointsXY(r, 0, 2 * Math.PI, 64);
    return pointsToGeometry(pts);
  }, [r]);

  const arcLabelPos = useMemo(() => {
    const arcRadius = Math.min(r * 0.4, 0.8) + 0.2;
    const midAngle = theta / 2;
    return new THREE.Vector3(
      arcRadius * Math.cos(midAngle),
      arcRadius * Math.sin(midAngle),
      0
    );
  }, [r, theta]);

  return (
    <group>
      {/* Radial line from origin to XY projection */}
      <Line from={origin} to={xyProj} color="#ff9933" opacity={0.95} />

      {/* Vertical line from XY projection up to point */}
      {zProgress > 0 && (
        <Line from={xyProj} to={pointFinal} color="#4488ff" opacity={0.9} />
      )}

      {/* Drop line from point to XY projection (dashed style) */}
      {showProjections && (
        <Line from={p} to={new THREE.Vector3(p.x, p.y, 0)} color="#888888" opacity={0.3} />
      )}

      {/* Circle in XY plane (full r circle) */}
      {showProjections && circleGeo && (
        <line>
          <primitive object={circleGeo} attach="geometry" />
          <lineBasicMaterial color="#ff9933" transparent opacity={0.15} />
        </line>
      )}

      {/* Theta arc */}
      {showAngleArcs && arcGeo && (
        <>
          <line>
            <primitive object={arcGeo} attach="geometry" />
            <lineBasicMaterial color="#cc44ff" transparent opacity={0.9} />
          </line>
          {arcRefGeo && (
            <line>
              <primitive object={arcRefGeo} attach="geometry" />
              <lineBasicMaterial color="#cc44ff" transparent opacity={0.4} />
            </line>
          )}
        </>
      )}

      {/* XY projection dot */}
      <mesh position={xyProj}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#ff9933" />
      </mesh>

      {/* Labels */}
      {showLabels && (
        <>
          {/* r label at midpoint of radial line */}
          <Html
            position={[xyProj.x / 2, xyProj.y / 2 - 0.3, 0]}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            <div className="text-xs font-mono font-bold text-orange-400 bg-surface-800/80 px-1 rounded">
              r = {fmt(r)}
            </div>
          </Html>

          {/* theta label */}
          {r > EPSILON && showAngleArcs && (
            <Html
              position={[arcLabelPos.x, arcLabelPos.y + 0.2, 0]}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              <div className="text-xs font-mono font-bold text-purple-400 bg-surface-800/80 px-1 rounded">
                θ = {toDeg(theta)}°
              </div>
            </Html>
          )}

          {/* z label */}
          {Math.abs(z) > EPSILON && (
            <Html
              position={[xyProj.x + 0.3, xyProj.y, pointFinal.z / 2]}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              <div className="text-xs font-mono font-bold text-blue-400 bg-surface-800/80 px-1 rounded">
                z = {fmt(z)}
              </div>
            </Html>
          )}
        </>
      )}
    </group>
  );
}
