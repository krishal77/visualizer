/** Core types for the EM Lab electrostatics module */

export interface Vec2 {
  x: number;
  y: number;
}

export interface Charge {
  id: string;
  /** Charge value — positive or negative, in normalized units */
  q: number;
  position: Vec2;
}

export interface FieldSample {
  Ex: number;
  Ey: number;
  magnitude: number;
  /** Angle in radians from +x axis */
  angle: number;
}

export interface ProbeSample {
  worldX: number;
  worldY: number;
  V: number;
  Ex: number;
  Ey: number;
  magnitude: number;
  angle: number;
  /** Distance from each charge */
  distances: { id: string; q: number; r: number; Ei: number; Vi: number }[];
}

export interface EMSettings {
  showHeatmap: boolean;
  showFieldLines: boolean;
  showVectors: boolean;
  showEquipotentials: boolean;
  showChargeLabels: boolean;
  fieldLineCount: number;
  vectorSpacing: number;
  equipotentialCount: number;
  heatmapOpacity: number;
  /** Potential value that maps to full color saturation */
  Vmax: number;
}
