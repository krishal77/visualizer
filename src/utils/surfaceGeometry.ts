/**
 * surfaceGeometry.ts
 * Generates THREE.BufferGeometry for 3D coordinate-range solids.
 * Each solid is the closed region bounded by min/max values of its three coordinates.
 *
 * Strategy: build each boundary face as a parametric grid (u,v) → Vector3,
 * concatenate all faces into one BufferGeometry, then call computeVertexNormals().
 */
import * as THREE from 'three';
import type { CartesianRanges, CylindricalRanges, SphericalRanges } from '../types/coordinates';

// ─── Low-level patch builder ──────────────────────────────────────────────────

type PosFn = (u: number, v: number) => [number, number, number];

/**
 * Appends a parametric quad-mesh patch to running arrays.
 * @param fn       (u,v)∈[0,1]² → (x,y,z)
 * @param uSegs    number of u subdivisions
 * @param vSegs    number of v subdivisions
 * @param flip     flip triangle winding (i.e. face inward)
 * @param positions accumulated position flat array
 * @param indices   accumulated index array
 */
function addPatch(
  fn: PosFn,
  uSegs: number,
  vSegs: number,
  flip: boolean,
  positions: number[],
  indices: number[]
) {
  const base = positions.length / 3;
  const uN = Math.max(2, uSegs);
  const vN = Math.max(2, vSegs);

  // Vertices
  for (let j = 0; j <= vN; j++) {
    for (let i = 0; i <= uN; i++) {
      const [x, y, z] = fn(i / uN, j / vN);
      positions.push(x, y, z);
    }
  }

  // Triangles
  for (let j = 0; j < vN; j++) {
    for (let i = 0; i < uN; i++) {
      const a = base + j * (uN + 1) + i;
      const b = a + 1;
      const c = a + (uN + 1);
      const d = c + 1;
      if (!flip) {
        indices.push(a, b, c, b, d, c);
      } else {
        indices.push(a, c, b, b, c, d);
      }
    }
  }
}

/** Build a BufferGeometry from accumulated positions + indices, with auto normals */
function buildGeometry(positions: number[], indices: number[]): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// ─── Cartesian Box ────────────────────────────────────────────────────────────

export function generateCartesianGeometry(ranges: CartesianRanges): THREE.BufferGeometry {
  const { x: { min: x1, max: x2 }, y: { min: y1, max: y2 }, z: { min: z1, max: z2 } } = ranges;
  const S = 4; // flat faces need only a 2×2 grid each

  const positions: number[] = [];
  const indices: number[] = [];

  const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2, cz = (z1 + z2) / 2;
  const dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;

  // Bottom (z=z1), Top (z=z2)
  addPatch((u, v) => [x1 + dx * u, y1 + dy * v, z1], S, S, true,  positions, indices);
  addPatch((u, v) => [x1 + dx * u, y1 + dy * v, z2], S, S, false, positions, indices);
  // Front (y=y1), Back (y=y2)
  addPatch((u, v) => [x1 + dx * u, y1, z1 + dz * v], S, S, false, positions, indices);
  addPatch((u, v) => [x1 + dx * u, y2, z1 + dz * v], S, S, true,  positions, indices);
  // Left (x=x1), Right (x=x2)
  addPatch((u, v) => [x1, y1 + dy * u, z1 + dz * v], S, S, true,  positions, indices);
  addPatch((u, v) => [x2, y1 + dy * u, z1 + dz * v], S, S, false, positions, indices);

  void cx; void cy; void cz; // suppress unused

  return buildGeometry(positions, indices);
}

// ─── Cylindrical Region ───────────────────────────────────────────────────────

/**
 * Generates geometry for the cylindrical region:
 *   r ∈ [r1, r2], θ ∈ [theta1, theta2] (radians), z ∈ [z1, z2]
 */
export function generateCylindricalGeometry(ranges: CylindricalRanges): THREE.BufferGeometry {
  const {
    r: { min: r1, max: r2 },
    theta: { min: th1, max: th2 },
    z: { min: z1, max: z2 }
  } = ranges;

  const S = 64; // angular segments
  const RS = Math.max(4, Math.ceil(S * Math.abs(r2 - r1) / r2));  // radial segments
  const ZS = Math.max(4, Math.ceil(S * Math.abs(z2 - z1) / (r2 + 0.01))); // height segments
  const thetaRange = th2 - th1;
  const TS = Math.max(4, Math.ceil(S * Math.abs(thetaRange) / (2 * Math.PI)));

  const fullCircle = Math.abs(thetaRange) >= 2 * Math.PI - 0.001;

  const positions: number[] = [];
  const indices: number[] = [];

  // Bottom annulus: z = z1, r ∈ [r1,r2], θ ∈ [th1,th2]
  addPatch(
    (u, v) => {
      const r = r1 + (r2 - r1) * u;
      const th = th1 + thetaRange * v;
      return [r * Math.cos(th), r * Math.sin(th), z1];
    },
    RS, TS, true, positions, indices
  );

  // Top annulus: z = z2
  addPatch(
    (u, v) => {
      const r = r1 + (r2 - r1) * u;
      const th = th1 + thetaRange * v;
      return [r * Math.cos(th), r * Math.sin(th), z2];
    },
    RS, TS, false, positions, indices
  );

  // Outer cylinder: r = r2
  addPatch(
    (u, v) => {
      const th = th1 + thetaRange * u;
      const z = z1 + (z2 - z1) * v;
      return [r2 * Math.cos(th), r2 * Math.sin(th), z];
    },
    TS, ZS, false, positions, indices
  );

  // Inner cylinder: r = r1 (skip if r1 ≈ 0)
  if (r1 > 0.001) {
    addPatch(
      (u, v) => {
        const th = th1 + thetaRange * u;
        const z = z1 + (z2 - z1) * v;
        return [r1 * Math.cos(th), r1 * Math.sin(th), z];
      },
      TS, ZS, true, positions, indices
    );
  }

  // Wedge faces at th1 and th2 (only when not a full circle)
  if (!fullCircle) {
    addPatch(
      (u, v) => {
        const r = r1 + (r2 - r1) * u;
        const z = z1 + (z2 - z1) * v;
        return [r * Math.cos(th1), r * Math.sin(th1), z];
      },
      RS, ZS, true, positions, indices
    );
    addPatch(
      (u, v) => {
        const r = r1 + (r2 - r1) * u;
        const z = z1 + (z2 - z1) * v;
        return [r * Math.cos(th2), r * Math.sin(th2), z];
      },
      RS, ZS, false, positions, indices
    );
  }

  return buildGeometry(positions, indices);
}

// ─── Spherical Region ─────────────────────────────────────────────────────────

/**
 * Generates geometry for the spherical region:
 *   ρ ∈ [rho1, rho2], θ ∈ [theta1, theta2] (radians), φ ∈ [phi1, phi2] (radians)
 *   Convention: φ=0 → north pole (+Z), φ=π → south pole (-Z)
 */
export function generateSphericalGeometry(ranges: SphericalRanges): THREE.BufferGeometry {
  const {
    rho: { min: rho1, max: rho2 },
    theta: { min: th1, max: th2 },
    phi: { min: ph1, max: ph2 }
  } = ranges;

  const S = 64;
  const thetaRange = th2 - th1;
  const phiRange = ph2 - ph1;
  const TS = Math.max(4, Math.ceil(S * Math.abs(thetaRange) / (2 * Math.PI)));
  const PS = Math.max(4, Math.ceil(S * Math.abs(phiRange) / Math.PI));
  const RS = Math.max(4, Math.ceil(S * Math.abs(rho2 - rho1) / rho2));

  const fullCircle = Math.abs(thetaRange) >= 2 * Math.PI - 0.001;
  const fullPhi = ph1 < 0.001 && ph2 > Math.PI - 0.001;

  const positions: number[] = [];
  const indices: number[] = [];

  // Outer spherical shell: ρ = rho2, θ ∈ [th1,th2], φ ∈ [ph1,ph2]
  addPatch(
    (u, v) => {
      const th = th1 + thetaRange * u;
      const ph = ph1 + phiRange * v;
      return [
        rho2 * Math.sin(ph) * Math.cos(th),
        rho2 * Math.sin(ph) * Math.sin(th),
        rho2 * Math.cos(ph)
      ];
    },
    TS, PS, false, positions, indices
  );

  // Inner spherical shell: ρ = rho1 (skip if rho1 ≈ 0)
  if (rho1 > 0.001) {
    addPatch(
      (u, v) => {
        const th = th1 + thetaRange * u;
        const ph = ph1 + phiRange * v;
        return [
          rho1 * Math.sin(ph) * Math.cos(th),
          rho1 * Math.sin(ph) * Math.sin(th),
          rho1 * Math.cos(ph)
        ];
      },
      TS, PS, true, positions, indices
    );
  }

  // φ = ph1 cone cap: ρ ∈ [rho1,rho2], θ ∈ [th1,th2]
  // Skip if ph1 ≈ 0 (north pole — degenerate ring)
  if (ph1 > 0.005) {
    addPatch(
      (u, v) => {
        const rho = rho1 + (rho2 - rho1) * u;
        const th = th1 + thetaRange * v;
        return [
          rho * Math.sin(ph1) * Math.cos(th),
          rho * Math.sin(ph1) * Math.sin(th),
          rho * Math.cos(ph1)
        ];
      },
      RS, TS, false, positions, indices
    );
  }

  // φ = ph2 cone cap: ρ ∈ [rho1,rho2], θ ∈ [th1,th2]
  // Skip if ph2 ≈ π (south pole — degenerate ring)
  if (ph2 < Math.PI - 0.005) {
    addPatch(
      (u, v) => {
        const rho = rho1 + (rho2 - rho1) * u;
        const th = th1 + thetaRange * v;
        return [
          rho * Math.sin(ph2) * Math.cos(th),
          rho * Math.sin(ph2) * Math.sin(th),
          rho * Math.cos(ph2)
        ];
      },
      RS, TS, true, positions, indices
    );
  }

  // θ-wedge faces (only when not a full circle)
  if (!fullCircle) {
    // θ = th1 face: ρ ∈ [rho1,rho2], φ ∈ [ph1,ph2]
    addPatch(
      (u, v) => {
        const rho = rho1 + (rho2 - rho1) * u;
        const ph = ph1 + phiRange * v;
        return [
          rho * Math.sin(ph) * Math.cos(th1),
          rho * Math.sin(ph) * Math.sin(th1),
          rho * Math.cos(ph)
        ];
      },
      RS, PS, true, positions, indices
    );
    // θ = th2 face
    addPatch(
      (u, v) => {
        const rho = rho1 + (rho2 - rho1) * u;
        const ph = ph1 + phiRange * v;
        return [
          rho * Math.sin(ph) * Math.cos(th2),
          rho * Math.sin(ph) * Math.sin(th2),
          rho * Math.cos(ph)
        ];
      },
      RS, PS, false, positions, indices
    );
  }

  void fullPhi; // suppress unused

  return buildGeometry(positions, indices);
}
