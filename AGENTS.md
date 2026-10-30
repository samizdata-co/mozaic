# AGENTS.md: working on mozaic

mozaic is a Svelte 5 + d3 chart library with house styles (SAMIZDATA, ZDG), embeds and print export.
Read `PLAN.md` for the design, `docs/adr/` for decisions and `apps/docs/src/content/` for the guides.

## Layout

- `packages/mozaic/src/lib/`: the library. Each folder is a subpath export (`mozaic/<folder>`).
  - `core/`: `Plot`, `Svg`, `Html`, `Canvas`, `Facets`, `usePlot()`, `useChart()`, `useTheme()`, `useLocale()`, `scaled()`, `position()`, `mm()`.
  - `frame/`: `Chart`, `Header`, `Title`, `Subtitle`, `Footer`, `Source`, `Notes`, `Byline`, `Logo`, `DataTable`, `DataDownload`.
  - `marks/`: `Bars`, `Line`, `Area`, `Points`, `Rects`, `Arcs`, `Text`, `Rules`, `GeoPath`, `Voronoi`, `LineEndLabels`, `Treemap`, `Waffle`, `Dumbbell`, `Arrows`, `Slope`, `Beeswarm`, `Hemicycle`, `Intervals`.
  - `guides/`: `AxisX`, `AxisY`, `GridX`, `GridY`, `Legend`, `ColorRamp`, `SizeLegend`, `Key`.
  - `annotations/`: `Callout`, `Arrow`, `Label`, `RefLine`, `RefBand`.
  - `interactive/`: `PointerArea`, `Tooltip`, `ButtonGroup`, `Scroller`.
  - `table/`: `Table`, `Sparkline`, `toCSV`. `transforms/`: `stack`, `bin`, `groupBy`, `rollup`, `indexTo`, `dodge`, `treemapLayout`, `avoidOverlap`, `hemicycleLayout`, `kernelSmooth`, `loess`.
  - `styles/`: themes (`samizdata` from the SAMIZDATA brand system, `zdg` from zdg.md, `plebiscit` for the Plebiscit.md poll tracker), `rampSteps`, `contrastRatio`, logos in `styles/logos/`. `locale/`: en, ro, ru. `embed/`: `Embed`, resize protocol, `hostScript`, `embedCode`. `export/`: `figureToSvg`, downloads. `recipes/`: complete chart templates, `BarChart`, `ColumnChart`, `LineChart`, `ScatterChart`, `ArrowChart` (arrow plot: change between two dates per row), `BarDotChart` (bars for the latest value, dots for an earlier one, value and change at the right).
  - `src/tests/`: server-render tests with fixtures.
- `packages/cli/`: `mozaic export` and `mozaic eject` (plain Node ESM + JSDoc).
- `packages/create-mozaic/`: scaffolder; `template/` is the analysis project (placeholders like `__STYLE__`).
- `apps/docs/`: docs site. Gallery examples in `src/lib/gallery/<slug>/` (`Chart.svelte` + `data.ts`); guides in `src/content/*.md`; the API reference is generated from component sources.

## How a chart is built

```svelte
<Chart {style} {locale} {medium} {width} alt="What the chart shows">
	<Header><Title>…</Title><Subtitle>…</Subtitle></Header>
	<Plot x={scaleLinear().domain([0, 100])} y={scaleBand().domain(names)} height={300}>
		{#snippet children(plot)}
			<Svg>…guides, marks, annotations…</Svg>
			<Html>…tooltips (positions from plot.x / plot.y)…</Html>
		{/snippet}
	</Plot>
	<Footer><Notes>…</Notes><Source>…</Source></Footer>
</Chart>
```

## Rules

- Scales are plain d3 scales. Set the **domain** in chart code; `<Plot>` sets the range.
- Sort, group, stack and compute domains in chart code or `transforms/`, never in marks.
- A new mark is a component that calls `usePlot()` and draws SVG. Use `scaled(scale, value)` (band centres) or `position(plot, x, y)` (also projections). Don't depend on internals.
- Colours come from the theme (`theme.palettes`); text colours from CSS tokens (`var(--mz-color-text)`, `--mz-color-muted`, …). Text never uses a data colour. Assign categorical colours by entity, in palette order; never cycle past the end.
- Anything that must print goes in `<Svg>`. `<Html>`, `<Canvas>`, tooltips and controls are hidden in print.
- Theme-dependent defaults must be `$derived`, not destructuring defaults.
- Use `Accessor<T, Value>`, never `Accessor<T, any>` (it erases callback types).
- A chart form that more than one project could use (not just one dataset) belongs here as a recipe in `recipes/`, not in the project: add it to `recipes/index.ts`, `RECIPES` in `packages/cli/src/eject.js` and `src/tests/recipes.spec.ts`. Projects wrap recipes with their data and strings.
- Every component has an `@component` comment and typed, JSDoc-commented `Props`: the API reference is generated from them.
- Every chart: `alt` text, a legend for 2+ series, all strings per locale, and a headline that is true of the data.
- Never nest interactive content (a chart can contain links and buttons; don't wrap it in `<a>`).
- Test at 320 px and 1000 px wide, in each style and language, and in print.

## Commands (repo root)

- `pnpm dev`: docs site at http://localhost:5173 (library source hot-reloads via the `mozaic-dev` condition)
- `pnpm check` · `pnpm test` · `pnpm lint` · `pnpm format`
- `pnpm build` then `pnpm test:e2e` (Playwright, axe) and `pnpm export`
- `pnpm changeset` after changing a published package
