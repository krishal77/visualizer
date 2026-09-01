/**
 * fieldLines.ts — Electric field line tracing via 4th-order Runge-Kutta
 *
 * Field lines originate at positive charges and terminate at negative charges
 * or at the world boundary. Integration follows the unit field direction vector.
 *
 * RK4 step: given position p, advance by stepSize along normalized E direction.
 */
import type { Vec2, Charge } from './types';
import { fieldDirection } from './coulomb';
import {
  FL_STEP, FL_MAX_STEPS, FL_SEED_RADIUS, FL_TERM_RADIUS, WORLD_HALF
} from './constants';

// ─── RK4 Integration ─────────────────────────────────────────────────────────

function rk4Step(
  pos: Vec2,
  charges: Charge[],
  ds: number,
  forward: boolean
): Vec2 {
  const sign = forward ? 1 : -1;
  const f = (p: Vec2): Vec2 => {
    const d = fieldDirection(charges, p);
    return { x: sign * d.x, y: sign * d.y };
  };

  const k1 = f(pos);
  const p2 = { x: pos.x + 0.5 * ds * k1.x, y: pos.y + 0.5 * ds * k1.y };
  const k2 = f(p2);
  const p3 = { x: pos.x + 0.5 * ds * k2.x, y: pos.y + 0.5 * ds * k2.y };
  const k3 = f(p3);
  const p4 = { x: pos.x + ds * k3.x, y: pos.y + ds * k3.y };
  const k4 = f(p4);

  return {
    x: pos.x + (ds / 6) * (k1.x + 2 * k2.x + 2 * k3.x + k4.x),
    y: pos.y + (ds / 6) * (k1.y + 2 * k2.y + 2 * k3.y + k4.y),
  };
}

// ─── Termination check ────────────────────────────────────────────────────────

function isOutOfBounds(p: Vec2, pad = 0.1): boolean {
  return (
    p.x < -WORLD_HALF - pad ||
    p.x > WORLD_HALF + pad ||
    p.y < -WORLD_HALF - pad ||
    p.y > WORLD_HALF + pad
  );
}

function isNearOppositeCharge(
  p: Vec2,
  charges: Charge[],
  sourceSign: number
): boolean {
  for (const c of charges) {
    if (Math.sign(c.q) === sourceSign) continue; // skip same-sign
    const dx = p.x - c.position.x;
    const dy = p.y - c.position.y;
    if (dx * dx + dy * dy < FL_TERM_RADIUS * FL_TERM_RADIUS) return true;
  }
  return false;
}

function isNearCharge(p: Vec2, charges: Charge[]): boolean {
  for (const c of charges) {
    const dx = p.x - c.position.x;
    const dy = p.y - c.position.y;
    if (dx * dx + dy * dy < FL_TERM_RADIUS * FL_TERM_RADIUS) return true;
  }
  return false;
}

// ─── Trace a single field line ────────────────────────────────────────────────

function traceFieldLine(
  start: Vec2,
  charges: Charge[],
  forward: boolean,
  sourceSign: number
): Vec2[] {
  const points: Vec2[] = [{ ...start }];
  let pos = { ...start };

  for (let step = 0; step < FL_MAX_STEPS; step++) {
    const next = rk4Step(pos, charges, FL_STEP, forward);

    // Terminate conditions
    if (isOutOfBounds(next)) {
      points.push(next);
      break;
    }
    if (isNearOppositeCharge(next, charges, sourceSign)) {
      points.push(next);
      break;
    }

    points.push(next);
    pos = next;

    // Stall detection — if field is nearly zero we'd loop forever
    const dx = next.x - pos.x;
    const dy = next.y - pos.y;
    if (Math.sqrt(dx * dx + dy * dy) < 1e-6 && step > 10) break;
  }

  return points;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export interface FieldLine {
  points: Vec2[];
  /** +1 or -1 — sign of the source charge */
  sourceSign: number;
}

/**
 * Compute all field lines for a set of charges.
 *
 * Strategy:
 * - Positive charges: seed forward (along E)
 * - Negative charges: seed backward (against E) when no positive charges exist
 * - Count of seeds scales with |q| * fieldLineCount setting
 */
export function computeFieldLines(
  charges: Charge[],
  fieldLineCount: number
): FieldLine[] {
  if (charges.length === 0) return [];

  const lines: FieldLine[] = [];
  const hasPositive = charges.some((c) => c.q > 0);

  // Always trace from positive charges forward
  for (const c of charges) {
    if (c.q <= 0) continue;
    const nSeeds = Math.max(4, Math.round(Math.abs(c.q) * fieldLineCount));
    for (let i = 0; i < nSeeds; i++) {
      const angle = (2 * Math.PI * i) / nSeeds;
      const seed: Vec2 = {
        x: c.position.x + FL_SEED_RADIUS * Math.cos(angle),
        y: c.position.y + FL_SEED_RADIUS * Math.sin(angle),
      };
      lines.push({
        points: traceFieldLine(seed, charges, true, 1),
        sourceSign: 1,
      });
    }
  }

  // If there are only negative charges, seed from boundary pointing inward
  if (!hasPositive) {
    const nSeeds = Math.max(8, fieldLineCount * 4);
    for (let i = 0; i < nSeeds; i++) {
      const angle = (2 * Math.PI * i) / nSeeds;
      const seed: Vec2 = {
        x: (WORLD_HALF - 0.3) * Math.cos(angle),
        y: (WORLD_HALF - 0.3) * Math.sin(angle),
      };
      if (isNearCharge(seed, charges)) continue;
      lines.push({
        points: traceFieldLine(seed, charges, false, -1),
        sourceSign: -1,
      });
    }
  }

  return lines;
}
