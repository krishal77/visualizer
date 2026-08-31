import { useMemo } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { CartesianCoords } from '../../types/coordinates';
import { fmt } from '../../utils/coordinateConversions';
import { pointsToGeometry } from '../../utils/geometry';

interface CartesianVisualizationProps {
  position: CartesianCoords;
  showProjections: boolean;
  showLabels: boolean;
  animProgress?: number;
}

function Line({
  from,
  to,
  color,
  opacity = 0.8,
  linewidth = 1,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  color: string;
  opacity?: number;
  linewidth?: number;
}) {
  const geo = useMemo(
    () => pointsToGeometry([from, to]),
    [from.x, from.y, from.z, to.x, to.y, to.z] // eslint-disable-line
  );
  return (
    <line>
      <primitive object={geo} attach="geometry" />
      <lineBasicMaterial color={color} transparent opacity={opacity} linewidth={linewidth} />
    </line>
  );
}

export function CartesianVisualization({
  position,
  showProjections,
  showLabels,
  animProgress = 1,
}: CartesianVisualizationProps) {
  const t = animProgress;
  const px = position.x * t;
  const py = position.y * t;
  const pz = position.z * t;

  const p = new THREE.Vector3(px, py, pz);
  const origin = new THREE.Vector3(0, 0, 0);
  const onX = new THREE.Vector3(px, 0, 0);
  const onY = new THREE.Vector3(0, py, 0);
  const onZ = new THREE.Vector3(0, 0, pz);
  const onXY = new THREE.Vector3(px, py, 0);
  const onXZ = new THREE.Vector3(px, 0, pz);
  const onYZ = new THREE.Vector3(0, py, pz);

  return (
    <group>
      {/* X component line: origin → (x, 0, 0) */}
      <Line from={origin} to={onX} color="#ff4444" opacity={0.9} />
      {/* Y component line: (x,0,0) → (x,y,0) */}
      <Line from={onX} to={onXY} color="#44ff44" opacity={0.9} />
      {/* Z component line: (x,y,0) → (x,y,z) */}
      <Line from={onXY} to={p} color="#4488ff" opacity={0.9} />

      {/* Projections to planes */}
      {showProjections && (
        <>
          {/* To XY plane */}
          <Line from={p} to={onXY} color="#888888" opacity={0.35} />
          {/* To XZ plane */}
          <Line from={p} to={onXZ} color="#888888" opacity={0.35} />
          {/* To YZ plane */}
          <Line from={p} to={onYZ} color="#888888" opacity={0.35} />
          {/* Foot connections */}
          <Line from={onXY} to={onX} color="#ff4444" opacity={0.25} />
          <Line from={onXY} to={onY} color="#44ff44" opacity={0.25} />
          <Line from={onXZ} to={onX} color="#ff4444" opacity={0.25} />
          <Line from={onXZ} to={onZ} color="#4488ff" opacity={0.25} />
          <Line from={onYZ} to={onY} color="#44ff44" opacity={0.25} />
          <Line from={onYZ} to={onZ} color="#4488ff" opacity={0.25} />
        </>
      )}

      {/* Labels */}
      {showLabels && (
        <>
          {/* x label */}
          <Html position={[px / 2, -0.35, 0]} style={{ pointerEvents: 'none', userSelect: 'none' }}>
            <div className="text-xs font-mono font-bold text-red-400 bg-surface-800/80 px-1 rounded">
              x = {fmt(position.x)}
            </div>
          </Html>
          {/* y label */}
          <Html position={[px, py / 2 - 0.2, 0]} style={{ pointerEvents: 'none', userSelect: 'none' }}>
            <div className="text-xs font-mono font-bold text-green-400 bg-surface-800/80 px-1 rounded">
              y = {fmt(position.y)}
            </div>
          </Html>
          {/* z label */}
          <Html position={[px + 0.3, py, pz / 2]} style={{ pointerEvents: 'none', userSelect: 'none' }}>
            <div className="text-xs font-mono font-bold text-blue-400 bg-surface-800/80 px-1 rounded">
              z = {fmt(position.z)}
            </div>
          </Html>
        </>
      )}

      {/* Endpoint dots on axes */}
      {[
        { pos: onX, color: '#ff4444' },
        { pos: onY, color: '#44ff44' },
        { pos: onZ, color: '#4488ff' },
      ].map(({ pos, color }, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}
