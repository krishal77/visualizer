# EM Lab — Electrostatics Module Implementation Plan

**Status:** ✅ COMPLETE  
**Last updated:** 2026-09-01

---

## Codebase Audit

Project: Vite + React 19 + TypeScript + Three.js/R3F + Tailwind CSS  
No existing EM code. Built from scratch in `src/em-lab/`.

---

## Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Rendering | HTML5 Canvas 2D | Heatmap needs pixel-level ops; Three.js overkill for 2D |
| Navigation | `activeModule` state | No router dep needed for 2 pages |
| Units | k=1 normalized | Clean visualization magnitudes |
| Heatmap resolution | 220×220 → scaled | 90k pixels is fast; appears smooth |

---

## Physics

- **E field**: `E_i = k*q_i / r_i²`, `E_total = ΣE_i`
- **Potential**: `V_i = k*q_i / r_i`, `V_total = ΣV_i`  
- **Relationship**: `E⃗ = −∇V`
- **Field lines**: RK4 integration, 4th-order Runge-Kutta, step=0.04
- **Equipotentials**: Marching squares (full 16-case lookup table), 120×120 grid

---

## File Structure

```
src/em-lab/
  physics/
    types.ts, constants.ts, coulomb.ts, fieldLines.ts, equipotential.ts
  renderers/
    coordTransform.ts, renderHeatmap.ts, renderFieldLines.ts,
    renderEquipotential.ts, renderVectors.ts
  components/
    EMLabCanvas.tsx, EMChargeControls.tsx, EMProbePanel.tsx,
    EMFormulaPanel.tsx, EMGraphPanel.tsx, EMSettingsBar.tsx
  presets.ts, EMLabPage.tsx
docs/IMPLEMENTATION_PLAN.md
```

---

## Implementation Phases

- [x] Phase 1: Physics engine (coulomb, field lines, equipotential)
- [x] Phase 2: Canvas renderers (heatmap, field lines, equipotentials, vectors)
- [x] Phase 3: EMLabCanvas (interactive 2D canvas with drag + probe)
- [x] Phase 4: UI panels (charge controls, probe, formulas, graphs, settings)
- [x] Phase 5: Integration (EMLabPage + App.tsx module switcher)
- [x] Phase 6: Verify (build passed, 0 TS errors) + push

---

## Features Implemented

- Potential heatmap (black→red/yellow for +V, black→blue/cyan for −V)
- Electric field lines with arrowheads (RK4 traced from + charges)
- Equipotential contour lines (marching squares, auto-leveled ±Vmax)
- E-field vector arrows (log-scaled magnitude, color-coded)
- Add/remove positive & negative charges, q ∈ [−5, +5] slider
- Drag charges interactively on canvas
- Hover probe: V, |E|, Ex, Ey, angle, per-charge breakdown
- 6 presets: Single+, Single−, Dipole, Two Equal+, Square Quad, Linear Chain
- Visibility toggles: heatmap, field lines, equipotentials, vectors, labels
- Parameter sliders: Vmax, heatmap opacity, field line count, equipotential count
- SVG live graphs: E(r) and V(r) from first charge
- Physics formula panel: E=kq/r², V=kq/r, E=−∇V, superposition
- Module switcher: Coordinates ↔ EM Lab in header
- Zero TypeScript errors, strict mode

---

## Known Limitations

- Heatmap recomputes fully on each render (could cache with useMemo on geometry hash)
- Field lines close to saddle points may loop (guarded by MAX_STEPS)
- No mobile/touch support (mouse-only)
- Graph always plots from q₁ outward along +x direction

---

## Testing

Physics spot-check: dipole at (±2, 0), probe at (0, 1):
- V = k*2/(√5) + k*(−2)/(√5) = 0 ✓ (V=0 on midplane of dipole)
- E points from + to − ✓
