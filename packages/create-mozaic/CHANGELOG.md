# @samizdata/create-mozaic

## 0.5.0

## 0.4.2

## 0.4.1

## 0.4.0

## 0.3.0

### Patch Changes

- 2b7a845: Chart details from the Prețuri gaz charts:

  - `AxisY` takes a `unit`, written once after the top tick label ("50 lei/m³"); on a left axis it runs into the plot, so it needs no extra padding.
  - `Tooltip` takes a `title` and `items` (label, value, colour, line or square swatch): one row per series, values aligned in a column.
  - `RefLine` labels can span several lines (`\n`); vertical lines take `anchor` (label right or left of the line), `labelY` (a negative value puts the label above the plot, with the line running up to it) and `dotted`.
  - `Waffle` takes `origin="bottom"` to fill from the bottom row up, so waffles of different totals share a baseline.
  - `mozaic export`: PNGs no longer include the icon buttons under the chart or a tooltip.
  - The project template's example chart uses the tooltip items and no longer adds a data table; its AGENTS.md says to add one only when asked.

## 0.2.0

### Minor Changes

- cdab3e3: Election charts: a `Hemicycle` mark (parliament chart with a majority line and a centre snippet), an `Intervals` mark (ranges with a point estimate, horizontal or vertical), and transforms `hemicycleLayout`, `kernelSmooth` (kernel-weighted average with optional weights and standard errors) and `loess`. New house style `plebiscit` (IBM Plex, neutral ink chrome so party colours carry the meaning). Gallery examples: poll tracker and parliament.

  Fix: before a plot is measured (server render, no JavaScript yet), `<Html>` layers are sized in percentages, so responsive charts no longer make the page scroll sideways on phones until hydration.

- c9ff742: House styles move out of the library. `mozaic/styles` no longer exports `samizdata`, `zdg`, `plebiscit`, `styles`, `StyleName` or `resolveStyle`: pass a `Theme` object to `<Chart style>` and the recipes (`base` by default). The SAMIZDATA and Ziarul de Gardă themes are now in their brand repositories (`datavis/mozaic/`), and Plebiscit.md keeps its own. New `checkTheme(theme)` lists problems with a style (missing tokens, short palettes, unreadable text). `create-mozaic` drops `--style`: projects get a `src/lib/theme.ts` that starts from `base`.
- 984c5db: First release: chart core (`Plot`, layers, `Facets`), 16 marks, guides, annotations, tables, transforms, SAMIZDATA and ZDG styles, en/ro/ru locales, embeds with auto-resize, SVG/PDF/PNG export, recipes, and the `create-mozaic` project template.
- Published on npm under GPL-3.0-or-later, in the `@samizdata` scope: `@samizdata/mozaic` (imports become `@samizdata/mozaic/frame` and so on), `@samizdata/mozaic-cli` (the command is still `mozaic`) and `@samizdata/create-mozaic` (`pnpm create @samizdata/mozaic`). The three packages are released together with the same version, and `@samizdata/create-mozaic` projects depend on that version of `@samizdata/mozaic` and `@samizdata/mozaic-cli` by default.
