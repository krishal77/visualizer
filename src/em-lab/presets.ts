/** Preset charge configurations */
import type { Charge } from './physics/types';

export interface Preset {
  name: string;
  description: string;
  charges: Omit<Charge, 'id'>[];
}

export const PRESETS: Preset[] = [
  {
    name: 'Single +',
    description: 'Single positive point charge',
    charges: [{ q: 2, position: { x: 0, y: 0 } }],
  },
  {
    name: 'Single −',
    description: 'Single negative point charge',
    charges: [{ q: -2, position: { x: 0, y: 0 } }],
  },
  {
    name: 'Dipole',
    description: 'Equal and opposite charges (electric dipole)',
    charges: [
      { q: 2, position: { x: -2, y: 0 } },
      { q: -2, position: { x: 2, y: 0 } },
    ],
  },
  {
    name: 'Two Equal +',
    description: 'Two equal positive charges — repulsion',
    charges: [
      { q: 2, position: { x: -2, y: 0 } },
      { q: 2, position: { x: 2, y: 0 } },
    ],
  },
  {
    name: 'Square Quad',
    description: 'Four charges at the corners of a square',
    charges: [
      { q: 2, position: { x: -2, y: 2 } },
      { q: -2, position: { x: 2, y: 2 } },
      { q: -2, position: { x: -2, y: -2 } },
      { q: 2, position: { x: 2, y: -2 } },
    ],
  },
  {
    name: 'Linear Chain',
    description: 'Alternating charges in a line',
    charges: [
      { q: 2, position: { x: -3.5, y: 0 } },
      { q: -2, position: { x: 0, y: 0 } },
      { q: 2, position: { x: 3.5, y: 0 } },
    ],
  },
];
