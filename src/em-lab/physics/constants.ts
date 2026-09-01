import type { EMSettings } from './types';

/** Normalized Coulomb constant (k=1 gives clean visualization magnitudes) */
export const K = 1;

/** Minimum distance — prevents division-by-zero singularity near charges */
export const EPSILON = 0.08;

/** World spans [-WORLD_HALF, +WORLD_HALF] in both axes */
export const WORLD_HALF = 5;

/** Field line integration step size (world units) */
export const FL_STEP = 0.04;

/** Maximum integration steps per field line */
export const FL_MAX_STEPS = 600;

/** Radius of seed circle around each charge for field line origins */
export const FL_SEED_RADIUS = 0.18;

/** A field line terminates when it enters this radius of any charge */
export const FL_TERM_RADIUS = 0.22;

/** Default EM visualization settings */
export const DEFAULT_EM_SETTINGS: EMSettings = {
  showHeatmap:       true,
  showFieldLines:    true,
  showVectors:       false,
  showEquipotentials: true,
  showChargeLabels:  true,
  fieldLineCount:    10,
  vectorSpacing:     0.8,
  equipotentialCount: 14,
  heatmapOpacity:    0.8,
  Vmax:              4,
};
