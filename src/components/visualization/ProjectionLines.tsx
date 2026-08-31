import { useMemo } from 'react';
import * as THREE from 'three';
import { pointsToGeometry } from '../../utils/geometry';
import type { CartesianCoords } from '../../types/coordinates';

interface ProjectionLinesProps {
  position: CartesianCoords;
  showProjections: boolean;
}

/** Thin dashed-style line between two points */
function Line({
  from,
  to,
  color,
  opacity = 0.5,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  color: string;
  opacity?: number;
}) {
  const geo = useMemo(
    () => pointsToGeometry([from, to]),
    [from.x, from.y, from.z, to.x, to.y, to.z] // eslint-disable-line react-hooks/exhaustive-deps
  );
  return (
    <line>
      <primitive object={geo} attach="geometry" />
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </line>
  );
}

export function ProjectionLines({ position, showProjections }: ProjectionLinesProps) {
  if (!showProjections) return null;

  const p = new THREE.Vector3(position.x, position.y, position.z);
  const onXY = new THREE.Vector3(p.x, p.y, 0);
  const onXZ = new THREE.Vector3(p.x, 0, p.z);
  const onYZ = new THREE.Vector3(0, p.y, p.z);
  const onX = new THREE.Vector3(p.x, 0, 0);
  const onY = new THREE.Vector3(0, p.y, 0);
  const onZ = new THREE.Vector3(0, 0, p.z);

  return (
    <group>
      {/* Drop line from point to XY plane */}
      <Line from={p} to={onXY} color="#888888" opacity={0.4} />

      {/* From XY projection to each axis */}
      <Line from={onXY} to={onX} color="#ff4444" opacity={0.45} />
      <Line from={onXY} to={onY} color="#44ff44" opacity={0.45} />

      {/* X-parallel lines to YZ plane */}
      <Line from={p} to={onYZ} color="#4488ff" opacity={0.25} />
      <Line from={onXY} to={onY} color="#888888" opacity={0.2} />

      {/* From point to XZ plane */}
      <Line from={p} to={onXZ} color="#44ff44" opacity={0.35} />

      {/* From XZ to X axis */}
      <Line from={onXZ} to={onX} color="#ff4444" opacity={0.35} />

      {/* From XZ to Z axis */}
      <Line from={onXZ} to={onZ} color="#4488ff" opacity={0.35} />

      {/* Vertical line from XY projection to Z axis */}
      <Line from={onXY} to={onX} color="#888888" opacity={0.2} />
    </group>
  );
}
