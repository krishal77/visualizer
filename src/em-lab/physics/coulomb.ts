/**
 * coulomb.ts — Electrostatics physics engine (pure functions, no side effects)
 *
 * All formulas use normalized units: k = 1
 *   E_i = k * q_i / r_i²  (field from charge i)
 *   V_i = k * q_i / r_i   (potential from charge i)
 *   E_total = ΣE_i         (superposition)
 *   V_total = ΣV_i
 */
import type { Vec2, Charge, FieldSample, ProbeSample } from './types';
import { K, EPSILON } from './constants';

// ─── Field from a single charge ───────────────────────────────────────────────

export function fieldFromCharge(charge: Charge, point: Vec2): Vec2 {
  const dx = point.x - charge.position.x;
  const dy = point.y - charge.position.y;
  const r2 = dx * dx + dy * dy;
  if (r2 < EPSILON * EPSILON) return { x: 0, y: 0 };
  const r = Math.sqrt(r2);
  const E = K * charge.q / r2;
  return { x: E * dx / r, y: E * dy / r };
}

// ─── Potential from a single charge ──────────────────────────────────────────

export function potentialFromCharge(charge: Charge, point: Vec2): number {
  const dx = point.x - charge.position.x;
  const dy = point.y - charge.position.y;
  const r = Math.sqrt(dx * dx + dy * dy);
  if (r < EPSILON) return charge.q > 0 ? Infinity : -Infinity;
  return K * charge.q / r;
}

// ─── Superposition ────────────────────────────────────────────────────────────

export function electricField(charges: Charge[], point: Vec2): FieldSample {
  let Ex = 0, Ey = 0;
  for (const c of charges) {
    const f = fieldFromCharge(c, point);
    Ex += f.x;
    Ey += f.y;
  }
  const magnitude = Math.sqrt(Ex * Ex + Ey * Ey);
  return { Ex, Ey, magnitude, angle: Math.atan2(Ey, Ex) };
}

export function electricPotential(charges: Charge[], point: Vec2): number {
  let V = 0;
  for (const c of charges) V += potentialFromCharge(c, point);
  return isFinite(V) ? V : 0;
}

// ─── Probe sample (combines field + potential + per-charge breakdown) ─────────

export function probeSample(charges: Charge[], wx: number, wy: number): ProbeSample {
  const point: Vec2 = { x: wx, y: wy };
  const field = electricField(charges, point);
  const V = electricPotential(charges, point);

  const distances = charges.map((c) => {
    const dx = wx - c.position.x;
    const dy = wy - c.position.y;
    const r = Math.sqrt(dx * dx + dy * dy);
    const Ei = r < EPSILON ? 0 : Math.abs(K * c.q / (r * r));
    const Vi = r < EPSILON ? 0 : K * c.q / r;
    return { id: c.id, q: c.q, r, Ei, Vi };
  });

  return {
    worldX: wx,
    worldY: wy,
    V,
    Ex: field.Ex,
    Ey: field.Ey,
    magnitude: field.magnitude,
    angle: field.angle,
    distances,
  };
}

// ─── Utility ─────────────────────────────────────────────────────────────────

/** Normalized unit vector of E at a point (used for RK4 integration) */
export function fieldDirection(charges: Charge[], point: Vec2): Vec2 {
  const f = electricField(charges, point);
  const mag = f.magnitude;
  if (mag < 1e-10) return { x: 0, y: 0 };
  return { x: f.Ex / mag, y: f.Ey / mag };
}
