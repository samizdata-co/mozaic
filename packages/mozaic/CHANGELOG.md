# @samizdata/mozaic

## 0.4.0

### Minor Changes

- dd45c71: A `PercentileChart` recipe for "how do you compare?" interactives: one strip per group with its published percentiles (range, middle half, median), a "you" line at the reader's value, set with a number box, a slider or by clicking or dragging on the strips, and the reader's estimated percentile in each group at the right, with an optional sentence for the highlighted group. In print the controls are hidden and the chart shows the starting value. `percentileRank` (in `transforms`) does the interpolation and can be used on its own. `mozaic eject PercentileChart` copies the recipe into a project.

## 0.3.0

### Minor Changes

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
- 984c5db: Real house styles: `samizdata` follows the SAMIZDATA brand system (Space Grotesk and Work Sans, paper background, raspberry accent, brand data palettes, three-bar logo) and `zdg` follows the zdg.md design (Source Serif and Source Sans, brand blue and coral, wordmark). Themes can now load web fonts (`theme.fonts`, `<Chart loadFonts>`) and show SVG logos. New tokens for label, control, strong, tooltip, grid-dash and radius styling, and new helpers `rampSteps` and `contrastRatio`.
- fbf3b3a: Icon buttons under charts. "Embed" is now an icon button that opens the embed code; `<DataTable>` becomes a "Show the data" icon button in the same row (and still works inside `<Embed>`); and a new "Download" icon button saves the chart as PNG or SVG. Turn downloads on per chart with `<Chart download>` (a string sets the file name; otherwise it comes from the title) or for every chart inside a component with `setDownloads()` from `mozaic/frame`; `download={false}` opts one out. The buttons are hidden in print and in exports; embed and download are hidden inside `<Embed>`.

  Exports: images end above the controls under the chart; `figureToSvg` takes a `padding` option, and `downloadSvg` / `downloadPng` add 20 px (`DOWNLOAD_PADDING`) around the chart; PNGs embed the page's web fonts the chart uses, so their text matches the page. New locale string `downloadImage`, and `fileName()` in `mozaic/export`.

- cdab3e3: Election charts: a `Hemicycle` mark (parliament chart with a majority line and a centre snippet), an `Intervals` mark (ranges with a point estimate, horizontal or vertical), and transforms `hemicycleLayout`, `kernelSmooth` (kernel-weighted average with optional weights and standard errors) and `loess`. New house style `plebiscit` (IBM Plex, neutral ink chrome so party colours carry the meaning). Gallery examples: poll tracker and parliament.

  Fix: before a plot is measured (server render, no JavaScript yet), `<Html>` layers are sized in percentages, so responsive charts no longer make the page scroll sideways on phones until hydration.

- cddbc6f: Embed codes under charts: `<Chart embed={{ src, scriptSrc }}>` (and the same `embed` prop on every recipe) adds an "Embed" control under the chart that opens its iframe code with a copy button. Paths are resolved against the page; the iframe title and height default to the chart's. The control is hidden in print, in SVG and PNG exports and inside `<Embed>`. New locale strings `embed`, `embedCode`, `copy` and `copied`, and a `ChartEmbed` type from `mozaic/embed`.
- c9ff742: House styles move out of the library. `mozaic/styles` no longer exports `samizdata`, `zdg`, `plebiscit`, `styles`, `StyleName` or `resolveStyle`: pass a `Theme` object to `<Chart style>` and the recipes (`base` by default). The SAMIZDATA and Ziarul de Gardă themes are now in their brand repositories (`datavis/mozaic/`), and Plebiscit.md keeps its own. New `checkTheme(theme)` lists problems with a style (missing tokens, short palettes, unreadable text). `create-mozaic` drops `--style`: projects get a `src/lib/theme.ts` that starts from `base`.
- 984c5db: First release: chart core (`Plot`, layers, `Facets`), 16 marks, guides, annotations, tables, transforms, SAMIZDATA and ZDG styles, en/ro/ru locales, embeds with auto-resize, SVG/PDF/PNG export, recipes, and the `create-mozaic` project template.
- b4da6c0: Logos can link somewhere (`theme.logo.href`, opened in a new tab so it works from embeds), and the wordmark is shown as written in the style instead of in capitals. The `plebiscit` style's wordmark now reads “Plebiscit.md” and links to https://plebiscit.md.
- Published on npm under GPL-3.0-or-later, in the `@samizdata` scope: `@samizdata/mozaic` (imports become `@samizdata/mozaic/frame` and so on), `@samizdata/mozaic-cli` (the command is still `mozaic`) and `@samizdata/create-mozaic` (`pnpm create @samizdata/mozaic`). The three packages are released together with the same version, and `@samizdata/create-mozaic` projects depend on that version of `@samizdata/mozaic` and `@samizdata/mozaic-cli` by default.
- fc6ca53: Two recipes for parts of a whole: `StackedBarChart` (100% stacked bars with the series name and share inside segments wide enough to hold them, optional brackets above the first bar grouping neighbouring series, a reference line and a legend of groups) and `MosaicChart` (a Marimekko chart: 100% stacked rows as tall as their totals, rows sorted by the share of chosen series, row labels nudged apart and series named inside their largest cell). Both can be ejected with `mozaic eject`.

### Patch Changes

- f470233: Chart SVGs are only labelled by a title that exists: a chart without `<Title>` (a bare chart inside a page) is labelled by its alt text instead of pointing screen readers at a missing element.
- a6a911e: `Tooltip` stays inside the chart: once measured, it changes side when there is no room on the usual one and slides over when neither side fits, so a wide tooltip on a narrow chart no longer runs off the left or right edge. The placement is `tooltipLeft` in `interactive/tooltip-position.ts`.
