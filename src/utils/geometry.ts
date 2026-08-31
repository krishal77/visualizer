import * as THREE from 'three';

// ─── Arc Generation ──────────────────────────────────────────────────────────

/**
 * Generate points along a circular arc in the XY plane.
 * @param radius - Radius of the arc
 * @param startAngle - Start angle in radians
 * @param endAngle - End angle in radians
 * @param segments - Number of line segments
 * @param offsetY - Vertical offset (for arcs at a given height)
 */
export function arcPointsXY(
  radius: number,
  startAngle: number,
  endAngle: number,
  segments = 64,
  offsetY = 0
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = startAngle + t * (endAngle - startAngle);
    points.push(new THREE.Vector3(
      radius * Math.cos(angle),
      radius * Math.sin(angle),
      offsetY
    ));
  }
  return points;
}

/**
 * Generate points along an arc in the vertical plane at a given azimuth angle (theta).
 * Used for the phi angle arc in spherical coordinates.
 * @param rho - Radius
 * @param theta - Azimuth angle (fixes the vertical plane)
 * @param startPhi - Start polar angle
 * @param endPhi - End polar angle
 * @param segments - Number of segments
 */
export function arcPointsSphericalPhi(
  rho: number,
  theta: number,
  startPhi: number,
  endPhi: number,
  segments = 64
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const phi = startPhi + t * (endPhi - startPhi);
    points.push(new THREE.Vector3(
      rho * Math.sin(phi) * Math.cos(theta),
      rho * Math.sin(phi) * Math.sin(theta),
      rho * Math.cos(phi)
    ));
  }
  return points;
}

// ─── Projection Helpers ──────────────────────────────────────────────────────

/** Project a 3D point onto the XY plane (z=0) */
export function projectOntoXY(p: THREE.Vector3): THREE.Vector3 {
  return new THREE.Vector3(p.x, p.y, 0);
}

/** Project a 3D point onto the XZ plane (y=0) */
export function projectOntoXZ(p: THREE.Vector3): THREE.Vector3 {
  return new THREE.Vector3(p.x, 0, p.z);
}

/** Project a 3D point onto the YZ plane (x=0) */
export function projectOntoYZ(p: THREE.Vector3): THREE.Vector3 {
  return new THREE.Vector3(0, p.y, p.z);
}

// ─── Geometry Helpers ────────────────────────────────────────────────────────

/** Create a BufferGeometry from an array of Vector3 points */
export function pointsToGeometry(points: THREE.Vector3[]): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  geometry.setFromPoints(points);
  return geometry;
}

/** 
 * Create a dashed line geometry segment between two points.
 * Returns flat [x1,y1,z1, x2,y2,z2] for LineSegments.
 */
export function dashedSegment(from: THREE.Vector3, to: THREE.Vector3): number[] {
  return [from.x, from.y, from.z, to.x, to.y, to.z];
}

/** Linear interpolate between two Vector3s */
export function lerpVec3(a: THREE.Vector3, b: THREE.Vector3, t: number): THREE.Vector3 {
  return new THREE.Vector3(
    a.x + (b.x - a.x) * t,
    a.y + (b.y - a.y) * t,
    a.z + (b.z - a.z) * t
  );
}

/** Get midpoint of an arc (for label placement) */
export function arcMidpoint(
  radius: number,
  startAngle: number,
  endAngle: number,
  height = 0
): THREE.Vector3 {
  const mid = (startAngle + endAngle) / 2;
  return new THREE.Vector3(
    radius * Math.cos(mid),
    radius * Math.sin(mid),
    height
  );
}
