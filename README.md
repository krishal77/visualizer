# 3D Coordinate Systems Visualizer

An interactive, educational web application for exploring and comparing **Cartesian**, **Cylindrical**, and **Spherical** coordinate systems in real-time 3D.

## Features

- 🎯 **Interactive 3D Point** — move it with XYZ sliders or direct numeric input
- 🔄 **Real-time Conversions** — all three coordinate systems update simultaneously
- 📐 **4 View Modes** — Cartesian, Cylindrical, Spherical, Compare All
- ▶️ **Play Animation** — step-by-step coordinate construction animation
- 🎓 **Educational Explanations** — toggle explanations for every coordinate
- 🌗 **Dark/Light Mode** — toggle with a switch
- ⚙️ **Display Settings** — toggle grid, projections, angle arcs, labels, planes
- 📍 **10 Presets** — Origin, axes, planes, examples, and random points
- 🔢 **Direct Coordinate Input** — enter cylindrical or spherical values directly

## Mathematical Conventions

| Coordinate | Symbol | Range | Definition |
|---|---|---|---|
| Azimuth | θ | [0°, 360°) | Measured from +X axis in XY plane, counter-clockwise |
| Polar | φ | [0°, 180°] | Measured from +Z axis downward (ISO 80000-2 physics convention) |
| Radial cylindrical | r | [0, ∞) | Distance from Z-axis |
| Radial spherical | ρ | [0, ∞) | Distance from origin |

All angles are stored internally in **radians** and displayed in **degrees**.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Tech Stack

| Layer | Library |
|---|---|
| Bundler | Vite 5 |
| UI | React 18 + TypeScript |
| 3D Engine | Three.js via @react-three/fiber |
| 3D Helpers | @react-three/drei |
| Styling | Tailwind CSS v3 |

## Project Structure

```
src/
├── types/coordinates.ts          # TypeScript types and constants
├── utils/
│   ├── coordinateConversions.ts  # Pure math: all 4 conversions + utilities
│   └── geometry.ts               # 3D geometry helpers (arcs, projections)
├── components/
│   ├── CoordinateSelector.tsx    # Mode tab bar
│   ├── CoordinateControls.tsx    # Sliders, inputs, presets, animation
│   ├── CoordinateDisplay.tsx     # Right panel coordinate values
│   ├── FormulaPanel.tsx          # Formula display with explanations
│   ├── SettingsPanel.tsx         # Toggle switches
│   └── visualization/
│       ├── CoordinateScene.tsx   # Main R3F Canvas + camera
│       ├── AxesHelper.tsx        # X/Y/Z axes with arrowheads
│       ├── CoordinatePoint.tsx   # Animated glowing point
│       ├── ProjectionLines.tsx   # Dashed projection lines
│       ├── AngleArc.tsx          # Angle arc rendering
│       ├── CartesianVisualization.tsx
│       ├── CylindricalVisualization.tsx
│       └── SphericalVisualization.tsx
└── App.tsx                       # Root layout and state management
```

## Controls

- **Orbit**: Left-click drag
- **Zoom**: Mouse wheel
- **Pan**: Right-click drag
- **Reset Camera**: Button in bottom-right of 3D scene

## Build

```bash
npm run build
```
