# ADR 0001: Our own chart core

- Status: accepted (Phase 0 spike)
- Date: 2026-10-25

## Context

mozaic needs to build any chart, in several house styles, for web embeds and
print. Most chart code will be written by AI. SveltePlot was rejected as too
opinionated: axes, legends and the title/caption layout cannot be replaced,
and margins and mark registration are internal. ONS svelte-charts is a set of
fixed templates. Layer Cake is close to what we want, but wraps d3 scales in
its own props and predates runes. See PLAN.md §2.1.

## Decision

Write a small core in `packages/mozaic/src/lib/core`:

- `<Plot>` measures its width, applies padding and sets the **range** of d3
  scales passed in as props. It never computes domains. A scale can also be
  given as a factory `(dims) => scale` for full control. A d3-geo projection
  can be given instead (with `fit` to fit it to the plot area).
- `<Svg>` and `<Html>` layers share one coordinate system.
- `usePlot()` returns reactive dimensions, scales, projection and path.
  `<Plot>`'s children snippet receives the same object, so chart code can use
  the ranged scales directly (e.g. to position a tooltip).
- `<Chart>` (frame) is renderer-agnostic. It applies the style (tokens as CSS
  custom properties) and locale, measures width for breakpoints, and shares
  them via `useChart()` / `useTheme()` / `useLocale()`.
- Marks, guides and annotations are plain components that use `usePlot()`.
  None relies on internal APIs, so any of them can be copied and edited.

## What the spike showed

Built: `Chart`, `Plot`, `Svg`, `Html`, `usePlot`; `AxisX`, `AxisY` (incl.
labels inside the plot), `GridX`, `GridY`, `Legend` (items, ordinal or
threshold scale); `Bars` (both orientations), `Line`, `Text`, `Rules`,
`GeoPath`, `LineEndLabels`; `Callout`; `PointerArea`, `Tooltip`; styles
`samizdata` and `zdg` (placeholder brand values at the time; real brand values since); locales `en`, `ro`, `ru`.

Test charts (apps/docs): sorted bars with a curved-arrow callout and a mobile
layout; four-series line chart with direct labels, crosshair and tooltip;
Moldova district choropleth with a threshold legend and hover.

Verified:

- Both packages type-check with `svelte-check` (0 errors), unit tests pass,
  `svelte-package` + `publint` pass.
- `vite build` prerenders all three charts as real SVG (no JS needed to see them).
- In the browser: correct rendering at 320–1000 px, live switching of style
  and language, tooltips and hover work, no console errors.
- Each SVG layer serialises to a standalone SVG with computed styles inlined
  (no CSS variables left, no NaN) that renders as an image. This is the basis
  for the Phase 4 print export.

Findings that changed the design:

- `Accessor<T, any>` erases callback types (`any | fn` collapses to `any`).
  Position accessors use `Accessor<T, Value>` with a concrete `Value` union.
- Theme-dependent prop defaults must be `$derived`, not destructuring
  defaults, or they will not follow a style change.
- HTML layers need the ranged scales, so `<Plot>` passes its context to its
  children snippet.
- Tokens live in each theme's TypeScript (applied inline on `<Chart>`)
  rather than separate CSS files: one source of truth, nothing to import.

## Consequences

- We maintain the core (~500 lines including types). Layer Cake remains the
  fallback; marks would port with small changes.
- Not yet done: the "AI writes a fourth chart from the docs alone" check, a
  `<Canvas>` layer, print mode and real brand values for both styles.
