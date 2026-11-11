# @samizdata/mozaic

## 0.12.0

### Minor Changes

- b6fb9a5: `BarChart`: new `range` prop for rows known only as a range (several suppliers, regions or estimates). The bar is solid to the low end and lighter to the high end, and the value label reads "low–high". `value` still sets the sort order.
- b6fb9a5: Flags, drawn as circles as in ggflags. `@samizdata/mozaic/flags` exports the square flags of flag-icons (MIT) as SVG markup, one per upper-case ISO code (`MD`, `RO`, `EU`, and Eurostat's `EL` and `UK`); import only the ones a chart uses. New marks `Flag` (one flag at a pixel position) and `Flags` (a flag per datum at its x/y). `Beeswarm`, `BarChart` (between each label and its bar) and `ScatterChart` take a `flag` accessor.
- b6fb9a5: Number formats: `createLocale(…).money` (two decimals, none for whole amounts: 26.14, 12.30, 26) and `decimals(n)` (n decimals, none when the value rounds to a whole number, so no "11.0" or "26.00").

  Recipes: tooltips can show units (`BarChart` and `StripChart` `unit`, `ScatterChart` `xUnit`/`yUnit`, whose tooltip now uses the `title`/`items` card). `StripChart`: `directions` (arrows under the axis, e.g. "← Cheaper", "Dearer →"), very soft gridlines (`grid`, on by default) and `axisLabel` for an axis title; `unit` now goes in the tooltip instead of on the axis. `ScatterChart`: `quadrants` (dashed dividing lines at two reference values and a label in each quarter's corner, wrapped to fit), `directions` (axis arrows, shown instead of the quarter labels when those don't fit), and `xDomain`/`yDomain`. With directions, the low end is dropped when both ends don't fit; leave an end empty for one arrow.

  `Tooltip`: no swatch column when no row has a colour, so the rows are no longer indented by an empty square. `StripChart` and `ScatterChart`: `emphasize` sets chosen labels in bold (`StripChart` labels are now regular unless emphasized).

  `AxisX`: new `unit`, written after the last labelled tick ("50.000 euro") and kept inside the chart, like `AxisY`'s after the top tick. Every recipe with a value axis now puts its unit there: `StripChart` (`unit`), `ScatterChart` (`xUnit`, `yUnit`), and a new `unit` on `ColumnChart`, `LineChart`, `ArrowChart` and `BarDotChart`, which also goes after the tooltip values.

  `BarChart`: value labels go inside the end of each bar where they fit (white on dark bars, the text colour on light ones) and after it otherwise (`labelsInside`, on by default). The bars now run to the largest value instead of a rounded-up maximum, and right-hand room is kept only for labels that stay outside, so there is no empty space on the right.

- b6fb9a5: New recipe `StripChart`: many items on one value axis as a beeswarm of dots or circular flags (`flag`), with labels and leader lines for highlighted items (`highlight`) and dashed reference lines labelled under the strip (`references`). The height follows the width so the swarm never overlaps. Much shorter than a bar chart of the same items.

## 0.11.0

### Minor Changes

- 8be68c8: Labels that fit the chart:

  - `AxisX`: on a continuous scale, tick labels that would overlap are thinned to every other tick (or every third, and so on), measured in the axis font; the tick marks stay.
  - `LineEndLabels`: a label too long for the room right of the plot breaks onto two or more lines instead of running off the chart, and its neighbours make room for it.
  - `avoidOverlap` takes optional `sizes` (each label's height in multiples of the gap), and `wrapLabel(text, maxWidth, measure)` (in `transforms`) breaks a label into lines.
  - `@samizdata/mozaic/cli` exports the CLI's building blocks, with types: `launchBrowser`, `findBrowser`, `browserCandidates` and `serveStatic`, for scripts that render charts their own way.
  - `LineEndLabels`: `dot={false}` leaves out the dot on the last point, for lines whose last point has a mark of its own (an election result's circle, say).

## 0.10.0

### Minor Changes

- ed99e36: - `BarChart`, `StackedBarChart`, `BarDotChart`, `ArrowChart`, `MosaicChart`: the gutter for row labels fits the labels as rendered. It was estimated from the number of characters, which left a wide empty margin in narrow fonts such as Source Sans (about 30 px for a 16-character label at 12 px). The estimate still sets the server-rendered layout; the width is measured once the chart mounts and again when web fonts load.
  - `AxisY`: a `\n` in a tick label breaks it into lines, centred on the tick (`'2026\n(Jan–Aug)'`). The recipes size their gutter by the widest line.
  - New in `core`: `useTextWidth()` for layouts that depend on text width, and `measureTextWidth(text, font)`.

### Patch Changes

- 457fc0b: `mozaic export`: when no Chromium is found, the message suggests `pnpm dlx playwright install chromium` (it used to say `npx`).

## 0.9.0

### Minor Changes

- 4e79156: `Footer`: notes and credits take the full width; the logo sits on the right of the `Source` line, at most one and a half lines tall. `Notes` renders nothing when its content is empty.

## 0.8.0

### Minor Changes

- d923e43: Labels in the series colour, as in Datawrapper, so they double as the legend. A colour too light to read is darkened (or lightened on dark backgrounds) until it reaches 4.5:1 against the style's background. Without the new options, labels stay in the text colour.

  - `LineEndLabels`: `colorText` colours each label like its line.
  - `Label`: `color` colours the label and its marker ring.
  - `Callout`: `color` colours the text and the arrow.
  - `readableColor(color, background)` in `@samizdata/mozaic/styles` returns the colour, or the closest shade of it that is readable as text, for your own marks.

## 0.7.0

### Minor Changes

- 3b9f07a: The `mozaic` command now ships with `@samizdata/mozaic`: `mozaic export` and `mozaic eject` work as before, and `@samizdata/mozaic-cli` is retired. Remove `@samizdata/mozaic-cli` from your project's dependencies; scripts such as `mozaic export build` keep working. `mozaic eject` lists and copies every recipe in the installed version, and `mozaic --version` prints the library's version.

## 0.6.0

### Minor Changes

- 2876d79: Linked sources: `<Source sources={[{ label, href }, …]} />` lists sources with optional links, joined with "; ", with the plural label for more than one. Links open in a new tab and are plain text in print. Every recipe's `source` prop takes the same list as well as plain text. New projects' AGENTS.md asks for linked sources.

## 0.5.1

### Patch Changes

- dc6872c: `Tooltip`: the card keeps its width as it moves. It used to shrink to the room left of its position, which moved it again and set off "ResizeObserver loop" errors when hovering near the right side of narrow charts.

## 0.5.0

### Minor Changes

- 63430ca: Highlights and touch tooltips:

  - `Waffle`: pointing at (or tapping) a category's squares highlights them and dims the rest. `bind:active` (the category's index) shares the highlight with a legend or another waffle; `dim` sets the opacity of the others and `interactive={false}` turns it off. Off in print. Squares have the class `mz-waffle-square`.
  - `Legend`: bind `active` (starting at `null`) to highlight the item under the pointer and dim the others, and to highlight an item from a mark. Without it the legend stays static.
  - `StackedBarChart`: pointing at a segment or a legend item highlights that series in every bar, its segment labels and its legend item (`interactive={false}` turns it off). A custom `legend` is not linked.
  - `PointerArea`: with touch, the tooltip no longer disappears when the finger lifts. It stays until the next tap outside the plot, and a touch that turns into a scroll still clears it.
  - `touchHold` (in `interactive`): the same touch handling for your own hover state.

## 0.4.2

### Patch Changes

- 1503740: `Title`: headlines wrap normally instead of with `text-wrap: balance`.

## 0.4.1

### Patch Changes

- 35d8235: `PercentileChart`: the "you" line is drawn under the rows and group names get a background halo, so the line no longer cuts through the names.

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
