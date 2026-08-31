import { useMemo } from 'react';
import * as THREE from 'three';
import { pointsToGeometry } from '../../utils/geometry';

interface AngleArcProps {
  radius: number;
  startAngle: number;
  endAngle: number;
  color: string;
  opacity?: number;
  lineWidth?: number;
  segments?: number;
  /** If true, arc is in XY plane. If false, arc is in the vertical plane at theta. */
  plane?: 'XY' | 'vertical';
  /** Theta angle (azimuth) — used when plane='vertical' */
  theta?: number;
  /** Vertical offset (for XY plane arcs above/below ground) */
  heightOffset?: number;
}

export function AngleArc({
  radius,
  startAngle,
  endAngle,
  color,
  opacity = 1,
  segments = 64,
  plane = 'XY',
  theta = 0,
  heightOffset = 0,
}: AngleArcProps) {
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const count = Math.max(2, segments);
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const angle = startAngle + t * (endAngle - startAngle);
      if (plane === 'XY') {
        points.push(new THREE.Vector3(
          radius * Math.cos(angle),
          radius * Math.sin(angle),
          heightOffset
        ));
      } else {
        // Vertical plane at azimuth theta: arc from +Z downward
        // phi is the angle from +Z
        points.push(new THREE.Vector3(
          radius * Math.sin(angle) * Math.cos(theta),
          radius * Math.sin(angle) * Math.sin(theta),
          radius * Math.cos(angle)
        ));
      }
    }
    return pointsToGeometry(points);
  }, [radius, startAngle, endAngle, plane, theta, heightOffset, segments]);

  return (
    <line>
      <primitive object={geometry} attach="geometry" />
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </line>
  );
}

// ─── Small tick at end of arc (for angle labels) ─────────────────────────────

interface ArcTickProps {
  angle: number;
  radius: number;
  color: string;
  plane?: 'XY' | 'vertical';
  theta?: number;
}

export function ArcTick({ angle, radius, color, plane = 'XY', theta = 0 }: ArcTickProps) {
  const points = useMemo(() => {
    const inner = radius * 0.9;
    const outer = radius * 1.1;
    if (plane === 'XY') {
      return [
        new THREE.Vector3(inner * Math.cos(angle), inner * Math.sin(angle), 0),
        new THREE.Vector3(outer * Math.cos(angle), outer * Math.sin(angle), 0),
      ];
    } else {
      return [
        new THREE.Vector3(
          inner * Math.sin(angle) * Math.cos(theta),
          inner * Math.sin(angle) * Math.sin(theta),
          inner * Math.cos(angle)
        ),
        new THREE.Vector3(
          outer * Math.sin(angle) * Math.cos(theta),
          outer * Math.sin(angle) * Math.sin(theta),
          outer * Math.cos(angle)
        ),
      ];
    }
  }, [angle, radius, plane, theta]);

  const geo = useMemo(() => pointsToGeometry(points), [points]);

  return (
    <line>
      <primitive object={geo} attach="geometry" />
      <lineBasicMaterial color={color} />
    </line>
  );
}
