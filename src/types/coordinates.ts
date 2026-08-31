// ─── Coordinate Types ───────────────────────────────────────────────────────

// ─── Display Mode ────────────────────────────────────────────────────────────

/** Whether to show a single point or a 3D surface region */
export type DisplayMode = 'point' | 'surface';

// ─── Coordinate Range ────────────────────────────────────────────────────────

export interface CoordRange {
  min: number;
  max: number;
}

export interface CartesianRanges {
  x: CoordRange;
  y: CoordRange;
  z: CoordRange;
}

/** theta is stored in RADIANS */
export interface CylindricalRanges {
  r: CoordRange;
  theta: CoordRange; // radians
  z: CoordRange;
}

/** theta and phi are stored in RADIANS */
export interface SphericalRanges {
  rho: CoordRange;
  theta: CoordRange; // radians, azimuth
  phi: CoordRange;   // radians, polar from +Z
}

export interface CartesianCoords {
  x: number;
  y: number;
  z: number;
}

export interface CylindricalCoords {
  r: number;      // radial distance from Z-axis [0, ∞)
  theta: number;  // azimuth angle in XY plane from +X axis, in RADIANS [0, 2π)
  z: number;      // height
}

export interface SphericalCoords {
  rho: number;    // distance from origin [0, ∞)
  theta: number;  // azimuth angle in XY plane from +X axis, in RADIANS [0, 2π)
  phi: number;    // polar angle from +Z axis downward, in RADIANS [0, π]
}

// ─── App Mode ────────────────────────────────────────────────────────────────

export type AppMode = 'cartesian' | 'cylindrical' | 'spherical' | 'compare';

// ─── Input System ────────────────────────────────────────────────────────────

export type CoordInputSystem = 'cartesian' | 'cylindrical' | 'spherical';

// ─── Settings ────────────────────────────────────────────────────────────────

export interface AppSettings {
  showGrid: boolean;
  showProjections: boolean;
  showAngleArcs: boolean;
  showLabels: boolean;
  showCoordPlanes: boolean;
  darkMode: boolean;
}

// ─── Animation ───────────────────────────────────────────────────────────────

export interface AnimationState {
  isPlaying: boolean;
  progress: number; // 0 to 1
  mode: AppMode;
}

// ─── Preset ──────────────────────────────────────────────────────────────────

export interface Preset {
  name: string;
  point: CartesianCoords;
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const AXIS_LENGTH = 5.5;
export const GRID_SIZE = 10;
export const POINT_MIN = -5;
export const POINT_MAX = 5;
export const EPSILON = 1e-10;
