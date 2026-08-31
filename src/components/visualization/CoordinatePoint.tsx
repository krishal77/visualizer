import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import type { CartesianCoords } from '../../types/coordinates';
import { fmt } from '../../utils/coordinateConversions';

interface CoordinatePointProps {
  position: CartesianCoords;
  showLabel: boolean;
}

export function CoordinatePoint({ position, showLabel }: CoordinatePointProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (glowRef.current) {
      glowRef.current.rotation.y += delta * 0.5;
      glowRef.current.rotation.x += delta * 0.3;
    }
  });

  const pos: [number, number, number] = [position.x, position.y, position.z];

  return (
    <group position={pos}>
      {/* Outer glow ring */}
      <mesh ref={glowRef}>
        <torusGeometry args={[0.18, 0.03, 8, 32]} />
        <meshStandardMaterial
          color="#58a6ff"
          emissive="#1f6feb"
          emissiveIntensity={2}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Core sphere */}
      <Sphere ref={meshRef} args={[0.12, 32, 32]}>
        <meshStandardMaterial
          color="#ffffff"
          emissive="#58a6ff"
          emissiveIntensity={1.5}
          roughness={0.1}
          metalness={0.8}
        />
      </Sphere>

      {/* Point glow (additive blend) */}
      <Sphere args={[0.22, 16, 16]}>
        <meshStandardMaterial
          color="#58a6ff"
          emissive="#58a6ff"
          emissiveIntensity={0.5}
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </Sphere>

      {/* Label */}
      {showLabel && (
        <Html
          position={[0.3, 0.3, 0]}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div className="bg-surface-800/90 border border-accent-primary/30 rounded-lg px-2 py-1 text-xs font-mono text-white whitespace-nowrap backdrop-blur-sm shadow-glow">
            <span className="text-axis-x">{fmt(position.x)}</span>
            <span className="text-surface-500">, </span>
            <span className="text-axis-y">{fmt(position.y)}</span>
            <span className="text-surface-500">, </span>
            <span className="text-[#4488ff]">{fmt(position.z)}</span>
          </div>
        </Html>
      )}
    </group>
  );
}
