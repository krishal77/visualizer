import type { CartesianCoords, CylindricalCoords, SphericalCoords } from '../types/coordinates';
import { EPSILON } from '../types/coordinates';

// ─── Cartesian → Cylindrical ─────────────────────────────────────────────────

export function cartesianToCylindrical(c: CartesianCoords): CylindricalCoords {
  const r = Math.sqrt(c.x * c.x + c.y * c.y);
  // atan2 returns (-π, π]; normalize to [0, 2π)
  let theta = Math.atan2(c.y, c.x);
  if (theta < 0) theta += 2 * Math.PI;
  return { r, theta, z: c.z };
}

// ─── Cartesian → Spherical ───────────────────────────────────────────────────

export function cartesianToSpherical(c: CartesianCoords): SphericalCoords {
  const rho = Math.sqrt(c.x * c.x + c.y * c.y + c.z * c.z);
  let theta = Math.atan2(c.y, c.x);
  if (theta < 0) theta += 2 * Math.PI;
  // phi = arccos(z / rho); handle origin case
  const phi = rho < EPSILON ? 0 : Math.acos(Math.max(-1, Math.min(1, c.z / rho)));
  return { rho, theta, phi };
}

// ─── Cylindrical → Cartesian ─────────────────────────────────────────────────

export function cylindricalToCartesian(c: CylindricalCoords): CartesianCoords {
  return {
    x: c.r * Math.cos(c.theta),
    y: c.r * Math.sin(c.theta),
    z: c.z,
  };
}

// ─── Spherical → Cartesian ───────────────────────────────────────────────────

export function sphericalToCartesian(c: SphericalCoords): CartesianCoords {
  return {
    x: c.rho * Math.sin(c.phi) * Math.cos(c.theta),
    y: c.rho * Math.sin(c.phi) * Math.sin(c.theta),
    z: c.rho * Math.cos(c.phi),
  };
}

// ─── Angle Utilities ─────────────────────────────────────────────────────────

/** Convert radians to degrees, rounded to given decimal places */
export function toDeg(rad: number, decimals = 2): number {
  return parseFloat((rad * (180 / Math.PI)).toFixed(decimals));
}

/** Convert degrees to radians */
export function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/** Format a number for display */
export function fmt(n: number, decimals = 3): string {
  if (Math.abs(n) < 1e-9) return '0.000';
  return n.toFixed(decimals);
}

/** Normalize angle to [0, 2π) */
export function normalizeAngle(a: number): number {
  const twoPi = 2 * Math.PI;
  return ((a % twoPi) + twoPi) % twoPi;
}

/** Safe division — returns 0 if denominator is near zero */
export function safeDivide(a: number, b: number): number {
  return Math.abs(b) < EPSILON ? 0 : a / b;
}

/** Clamp a value between min and max */
export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
