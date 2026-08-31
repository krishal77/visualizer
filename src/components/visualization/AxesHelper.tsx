import { useMemo } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { AXIS_LENGTH } from '../../types/coordinates';

interface AxisProps {
  direction: THREE.Vector3;
  color: string;
  label: string;
  showLabels: boolean;
}

function Axis({ direction, color, label, showLabels }: AxisProps) {
  const length = AXIS_LENGTH;
  const shaftLength = length - 0.5;
  const shaftRadius = 0.025;
  const coneHeight = 0.45;
  const coneRadius = 0.08;

  // Quaternion to rotate from Y-up to direction
  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
    return q;
  }, [direction]);

  const shaftPos = direction.clone().multiplyScalar(shaftLength / 2);
  const tipPos = direction.clone().multiplyScalar(shaftLength + coneHeight / 2);
  const labelPos = direction.clone().multiplyScalar(length + 0.3);

  return (
    <group>
      {/* Shaft */}
      <mesh position={shaftPos} quaternion={quaternion}>
        <cylinderGeometry args={[shaftRadius, shaftRadius, shaftLength, 8]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Arrowhead cone */}
      <mesh position={tipPos} quaternion={quaternion}>
        <coneGeometry args={[coneRadius, coneHeight, 12]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Negative axis (dashed appearance via thin shaft) */}
      <mesh
        position={direction.clone().multiplyScalar(-length / 2)}
        quaternion={quaternion}
      >
        <cylinderGeometry args={[shaftRadius * 0.6, shaftRadius * 0.6, length, 8]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.25}
          roughness={0.5}
        />
      </mesh>

      {/* Label */}
      {showLabels && (
        <Html
          position={[labelPos.x, labelPos.y, labelPos.z]}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div
            style={{ color, fontWeight: 700, fontSize: '16px', textShadow: `0 0 10px ${color}` }}
            className="font-mono"
          >
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

interface AxesHelperProps {
  showLabels: boolean;
}

export function AxesHelper({ showLabels }: AxesHelperProps) {
  return (
    <group>
      {/* X axis — Red */}
      <Axis
        direction={new THREE.Vector3(1, 0, 0)}
        color="#ff4444"
        label="X"
        showLabels={showLabels}
      />
      {/* Y axis — Green */}
      <Axis
        direction={new THREE.Vector3(0, 1, 0)}
        color="#44ff44"
        label="Y"
        showLabels={showLabels}
      />
      {/* Z axis — Blue */}
      <Axis
        direction={new THREE.Vector3(0, 0, 1)}
        color="#4488ff"
        label="Z"
        showLabels={showLabels}
      />

      {/* Origin dot */}
      <mesh>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#888888" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}
