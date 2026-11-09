# @samizdata/mozaic-cli

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

- 316f8a4: Arrow plots: an `Arrows` mark (one arrow per row from a start to an end value; arrows shorter than their head show the head alone) and two recipes, `ArrowChart` (arrow plot with end values beside the arrowheads, the two dates labelled above the first arrow, and dots for rows with only one value) and `BarDotChart` (bars for the latest value, a dot for an earlier one, and the value and change at the right). Both can be ejected with `mozaic eject`.
- 984c5db: First release: chart core (`Plot`, layers, `Facets`), 16 marks, guides, annotations, tables, transforms, SAMIZDATA and ZDG styles, en/ro/ru locales, embeds with auto-resize, SVG/PDF/PNG export, recipes, and the `create-mozaic` project template.
- Published on npm under GPL-3.0-or-later, in the `@samizdata` scope: `@samizdata/mozaic` (imports become `@samizdata/mozaic/frame` and so on), `@samizdata/mozaic-cli` (the command is still `mozaic`) and `@samizdata/create-mozaic` (`pnpm create @samizdata/mozaic`). The three packages are released together with the same version, and `@samizdata/create-mozaic` projects depend on that version of `@samizdata/mozaic` and `@samizdata/mozaic-cli` by default.
- fc6ca53: Two recipes for parts of a whole: `StackedBarChart` (100% stacked bars with the series name and share inside segments wide enough to hold them, optional brackets above the first bar grouping neighbouring series, a reference line and a legend of groups) and `MosaicChart` (a Marimekko chart: 100% stacked rows as tall as their totals, rows sorted by the share of chosen series, row labels nudged apart and series named inside their largest cell). Both can be ejected with `mozaic eject`.
