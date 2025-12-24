# Croppie Modernization Design

**Date**: 2025-12-23
**Status**: Approved

## Mission

A modern, minimal Croppie fork with full v2.6 API compatibility.

## Goals (Balanced Priority)

1. **Build size**: ~15KB gzipped
2. **API compatibility**: 100% compatible with Croppie v2.6 public interface
3. **Testing**: Comprehensive unit, integration, and visual regression tests

## Targets

- **Bundle size**: ~15KB gzipped
- **Browser support**: ES2022+ (Chrome 94+, Firefox 93+, Safari 15+)
- **API**: 100% compatible with Croppie v2.6

## What "API Compatible" Means

- Same constructor signature: `new Croppie(element, options)`
- Same methods: `bind()`, `result()`, `get()`, `setZoom()`, `rotate()`, `destroy()`
- Same options: `viewport`, `boundary`, `enableExif`, `enableResize`, `mouseWheelZoom`, etc.
- Same events: `update`, `zoom`
- **Backwards-compatible points format**: Accept both array `[x1,y1,x2,y2]` AND object `{topLeftX,...}`

## Features to Implement

| Feature | Effort | Description |
|---------|--------|-------------|
| Points array format | Low | Accept v2.6 array format, return object format |
| Rotation | Medium | 90° increment rotation with CSS + canvas support |
| EXIF orientation | Medium | Auto-correct photo orientation, inline parser |
| Resize handles | Higher | Draggable viewport resize with aspect ratio option |

## Out of Scope

- jQuery plugin wrapper (original had this)
- IE11 / legacy browser support
- Canvas-only mode (original had this)

## Testing Strategy

### Tier 1: Unit Tests (Bun)

**Location**: `tests/unit/`
**Run**: `bun test`

Coverage:
- Pure functions and utilities
- Points format conversion
- Zoom clamping logic
- Rotation angle normalization
- EXIF orientation mapping

### Tier 2: Integration Tests (Bun + happy-dom)

**Location**: `tests/integration/`
**Run**: `bun test tests/integration`

Coverage:
- Constructor creates correct DOM structure
- `bind()` loads images and sets initial state
- `result()` returns correct output formats
- `get()` returns current crop data
- `setZoom()` updates zoom within bounds
- `rotate()` transforms image correctly
- Event emission (`update`, `zoom`)
- `destroy()` cleans up properly

### Tier 3: Visual Regression (Playwright)

**Location**: `tests/visual/`
**Run**: `bunx playwright test`

Coverage:
- Circle/square viewport rendering
- Zoom levels render correctly
- Rotation renders correctly
- `result()` output matches expected crops

## Build & Tooling

### Current (Keep)

- **Bundler**: Bun
- **Linting**: Biome
- **Types**: TypeScript 5.9, strict mode

### Additions

**Dev dependencies**:
- `@playwright/test` - Visual regression
- `happy-dom` - Lightweight DOM for integration tests

**Scripts**:
```json
{
  "test": "bun test",
  "test:integration": "bun test tests/integration",
  "test:visual": "bunx playwright test",
  "test:all": "bun test && bunx playwright test"
}
```

**GitHub Actions CI**:
- Run unit + integration tests
- Run visual regression tests
- Verify build works
- Track bundle size over time

## Project Structure

```
croppie/
├── src/
│   ├── index.ts              # Public exports
│   ├── Croppie.ts            # Main class
│   ├── types.ts              # TypeScript types
│   ├── croppie.css           # Styles
│   ├── canvas/
│   │   └── draw.ts           # Canvas rendering
│   ├── input/
│   │   ├── drag.ts           # Pointer drag
│   │   └── zoom.ts           # Wheel/pinch zoom
│   ├── ui/
│   │   ├── elements.ts       # DOM creation
│   │   └── resize.ts         # NEW: Resize handles
│   └── utils/
│       ├── clamp.ts
│       ├── debounce.ts
│       ├── dom.ts
│       ├── image.ts
│       ├── points.ts         # NEW: Points conversion
│       ├── rotation.ts       # NEW: Rotation helpers
│       └── exif.ts           # NEW: EXIF parser
├── tests/
│   ├── unit/                 # Bun unit tests
│   ├── integration/          # Bun + happy-dom
│   └── visual/               # Playwright screenshots
├── docs/
│   ├── decisions/            # ADRs
│   └── plans/                # Design docs
├── dist/                     # Build output
├── playwright.config.ts      # Playwright config
└── package.json
```

## Documentation

- **ADRs**: `docs/decisions/` - Document architectural decisions
- **Roadmap**: GitHub Projects - Track features and milestones
- **Changelog**: `CHANGELOG.md` - Track releases

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| ES2022 only, no legacy builds | Bundle size priority; users can transpile if needed |
| No jQuery wrapper | Modern apps don't use jQuery; reduces bundle |
| No canvas-only mode | Adds complexity; viewport mode covers 99% of use cases |
| Points accept array OR object | Backwards compat with v2.6 without breaking new API |
| Pointer Events over Mouse Events | Modern API, better touch support, less code |
| Bun for unit tests, Playwright for visual | Fast unit tests + real browser visual regression |
| Zero runtime dependencies | Bundle size; self-contained library |
