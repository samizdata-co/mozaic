# mozaic — Technical Implementation Plan

> Status: proposal (rev. 2: our own core instead of SveltePlot) · 2026-10-25 · based on [docs/README.md](docs/README.md)

## 1. Goals and non-goals

**Goals**

- A personal, evolving library for building **any** chart: simple charts (bar, line, area, scatter, table, treemap), interactive pieces (tooltips, scrollytelling) and maps.
- **Grammar-of-graphics thinking without a grammar engine.** Charts are still built as data → scales → marks → guides, but scales are plain d3 scales and marks are ordinary Svelte components. Anything d3 can draw, mozaic can draw.
- **Written mostly by AI.** We optimise for explicitness, predictability and good docs and examples, not for brevity.
- **Multiple house styles** (SAMIZDATA for samizdata.co, Ziarul de Gardă for zdg.md, more later) that you switch with a single prop, without touching the chart code.
- **Reusable chart chrome**: title, subtitle, legend, annotations, notes, source, byline, logo.
- **One repo per analysis**: R/Python wrangling plus one or two charts, built into **self-contained static embeds** for the web and **SVG/PDF/PNG** for print.
- Old embeds never break when the library changes.

**Non-goals**

- A config-driven chart catalogue in the style of ECharts, Highcharts or Datawrapper. Preset "recipes" can exist, but they are thin, readable compositions of primitives that you can always eject from.
- A visual chart editor or a CMS.
- A full cartography stack (tile servers, GIS editing).

---

## 2. Core decisions

| Concern                   | Choice                                                                                                                                                | Why                                                                                                                                                                   |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI framework              | **Svelte 5 + SvelteKit**                                                                                                                              | You know it already, it compiles to small bundles (good for embeds), and SSR/prerender gives SVG that works without JS (good for print and noscript).                 |
| Chart core                | **Our own small core** (`Plot`, layers, `usePlot()`), modelled on Layer Cake and written with Svelte 5 runes                                          | A few hundred lines that hold dimensions, d3 scales and layers in context. Every mark, axis and legend is our own component, so nothing is fixed or hidden. See §2.1. |
| Fallback core             | Layer Cake                                                                                                                                            | Plan B if writing our own core proves slower than expected. Its model is nearly the same, so marks would port with small changes.                                     |
| Maths and layout          | d3 modules (`d3-scale`, `d3-shape`, `d3-array`, `d3-geo`, `d3-hierarchy`, `d3-force`, `d3-delaunay`, `d3-format`, `d3-time-format`) used **directly** | The standard toolkit, with no wrapper between it and the chart. Any chart on Observable or bl.ocks can be ported, and AI models know d3 very well.                    |
| Static maps               | `d3-geo` + TopoJSON rendered by a `GeoPath` mark                                                                                                      | Plain SVG output, so print-ready and styleable.                                                                                                                       |
| Interactive / slippy maps | **MapLibre GL JS** + **PMTiles** (Protomaps basemap, self-hosted)                                                                                     | No API keys or vendor lock-in, and tiles are just a static file.                                                                                                      |
| Scrollytelling            | Small in-house `Scroller` built on `IntersectionObserver`                                                                                             | Tiny and fully controllable. It follows the pattern used by The Pudding and ONS.                                                                                      |
| Theming                   | CSS custom properties (visual tokens) + a typed JS theme object (palettes, scale defaults, formats) supplied through Svelte context                   | CSS covers fonts and colours. JS covers what scales and number formats need.                                                                                          |
| Embeds                    | SvelteKit `adapter-static`: one prerendered route per chart, embedded with an auto-resizing `<iframe>`                                                | The iframe isolates the chart from WordPress/CMS CSS and works on any site.                                                                                           |
| Print export              | Playwright renders the prerendered routes, then serialises the SVG with styles inlined and writes PDF/PNG                                             | One code path for web and print.                                                                                                                                      |
| Monorepo tooling          | pnpm workspaces, TypeScript, Vitest, Playwright, Changesets                                                                                           | Standard and low-maintenance.                                                                                                                                         |
| Analysis tooling          | `uv` (Python), `renv` (R), `just` as the task runner                                                                                                  | Reproducible environments and one command per step.                                                                                                                   |

### 2.1 Why our own core

Options considered:

| Option                                                     | Extensibility                                                                                                                                               | Main problem for mozaic                                                                                                                                                                                                                                    |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SveltePlot** (v0.14, pre-1.0, mostly one maintainer)     | Medium. You can write custom marks (`CustomMark`, or raw SVG children using `mapXY`), set defaults with `setPlotDefaults`, and read state with `usePlot()`. | Its pipeline is opinionated. Axes and legends cannot be replaced, only configured. Title, subtitle and caption placement is fixed. Auto-margins and mark registration are internal. You extend _inside_ its model, and fight it when you leave that model. |
| **ONS svelte-charts** (`@onsvisual/svelte-charts` v0.4.11) | Low. It offers fixed templates (`LineChart`, `BarChart`, …) with props and slots.                                                                           | Built on Layer Cake, but its public API is rigid chart templates: the ECharts problem in Svelte. Svelte 4 syntax, little documentation, and maps and annotations are commented out. **Useful as a reference for patterns, not as a dependency.**           |
| **Layer Cake**                                             | High. It handles only dimensions, scales and layers (Svg/Html/Canvas), and you write every layer.                                                           | Very close to what we want. Its scale API is a set of props between you and d3 (`xDomain`, `xNice`, `xPadding`, `xReverse`…), and its design predates runes.                                                                                               |
| **LayerChart**                                             | Medium–high. A large component set on top of Layer Cake.                                                                                                    | Adds a second layer of opinions on top of Layer Cake that we would mostly restyle or bypass.                                                                                                                                                               |
| **Own core, modelled on Layer Cake**                       | Total                                                                                                                                                       | We have to write and maintain it. In practice that is small (~300–500 lines for the core), and we would write every mark anyway to match two house styles.                                                                                                 |

**Recommendation: write our own core.** It takes Layer Cake's design (a container that measures itself, holds scales in context and stacks layers) and adds:

- **Real d3 scales, passed in.** You give `scaleLinear().domain([0, 100])` and the core only sets the range from the measured size. There is no scale DSL to learn, and any d3 scale works, including log, symlog, time, band, point, threshold, quantile and custom ones.
- **Svelte 5 runes throughout**, so `usePlot()` returns reactive values without stores.
- **Print as a first-class mode.** The core controls layout, so it can render the header and footer into SVG and use fixed mm sizes (§9). We could not do that inside someone else's `<Plot>`.
- **No hidden rendering.** Axes, gridlines, legends and marks are all mozaic components that AI can read, copy and change.

The grammar-of-graphics _ideas_ stay, as conventions rather than an engine:

| ggplot concept          | mozaic equivalent                                                                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `data` + `aes()`        | `data` prop + accessor props (`x={d => d.year}`) on every mark                                                         |
| `scale_*`               | plain d3 scales on `<Plot>` (`x`, `y`, plus named `scales={{ color, r }}`)                                             |
| `geom_*`                | mark components (`Bars`, `Line`, `Area`, `Points`, `Text`, `Rules`, `GeoPath`, …)                                      |
| `stat_*` / `position_*` | pure functions in `mozaic/transforms` (stack, bin, rollup, dodge, normalise), run on the data before it reaches a mark |
| `facet_*`               | `<Facets>`: a grid layout that renders one `<Plot>` per group with shared or free scales                               |
| `theme()`               | the house style (§4)                                                                                                   |
| `annotate()`            | `mozaic/annotations`                                                                                                   |

**Other renderers still fit.** `<Chart>` (§3.2) does not care what renders inside it. A single chart can use Observable Plot, SveltePlot, Layer Cake or hand-written d3 when that is the quickest route, and still get the house frame and export. None of them is a dependency of the core.

---

## 3. Architecture

```
┌──────────────────────────── analysis repo (one per story) ────────────────────────────┐
│  R / Python  ──►  data/*.csv|json  ──►  src/charts/*.svelte  ──►  build  ──►  dist/    │
│  (uv, renv)       (tidy, long form)     (uses mozaic)            (static)     embeds,  │
│                                                                               svg/pdf  │
└──────────────────────────────────────────▲─────────────────────────────────────────────┘
                                           │ pnpm dependency (pinned version)
┌──────────────────────────────── mozaic (this repo) ───────────────────────────────────┐
│  core/  marks/  transforms/  guides/  annotations/  frame/  recipes/                    │
│  table/  maps/  scrolly/                                                               │
│  styles/{samizdata,zdg}/   locale/   embed/   export/   cli/                           │
│  apps/docs  →  gallery + docs + per-style visual regression                            │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Layers inside mozaic

1. **Core** (`mozaic/core`): `Plot`, the layers `Svg` / `Html` / `Canvas`, `usePlot()`, and scale helpers (§3.4).
2. **Transforms** (`mozaic/transforms`): pure, unit-tested data functions built on d3: `stack`, `bin`, `rollup`, `normalize`, `dodge` (beeswarm), `treemap`, `labelAvoid`. They play the role of ggplot's stats and positions.
3. **Marks** (`mozaic/marks`): components that read scales from `usePlot()` and draw one kind of shape. Basic marks: `Bars` (horizontal or vertical, from the scales), `Line`, `Area`, `Points`, `Rules`, `Rects`, `Text`, `Arcs`, `Path` (takes any d3 shape generator), `GeoPath`. Compound marks: `Treemap`, `Waffle`, `Slope`, `Dumbbell`, `Beeswarm`, `LineEndLabels`, `Sparkline`.
4. **Guides** (`mozaic/guides`): `AxisX`, `AxisY`, `GridX`, `GridY`, and legends (categorical, continuous ramp, size). All are ordinary components, so a one-off axis is just a copied, modified file.
5. **Annotations** (`mozaic/annotations`): text callouts, curved arrows, reference lines and bands, highlighted ranges, labelled points. Positions can be given in data space or pixel space, and you can supply separate positions per breakpoint.
6. **Frame / chrome** (`mozaic/frame`): `<Chart>` is the outer component. It applies the style and locale, measures its width, provides context, and lays out the header, plot area and footer.
7. **Recipes** (`mozaic/recipes`): short, readable compositions such as `BarChart`, `LineChart`, `StackedArea`, `Choropleth`. They save time and are not a catalogue to be constrained by. `mozaic eject <recipe>` copies a recipe's source into the analysis repo so you can change it freely (the shadcn/ui approach).
8. **Non-plot components**: `Table`, `Scroller`, `MapLibreMap`, `BigNumber`.

### 3.2 `<Chart>` is renderer-agnostic

`<Chart>` does not care what is inside its plot slot. Usually it is a mozaic `<Plot>`, but it could be a hand-written `<svg>`, Observable Plot output, a MapLibre canvas or a `<Table>`. It provides through context:

- `width` / `height` of the plot area (from a `ResizeObserver`, with a fixed size for print)
- `theme` (resolved style tokens + JS defaults)
- `locale` (number/date formatters, strings)
- `medium`: `'web' | 'print'`
- `breakpoint`: `'s' | 'm' | 'l'` (thresholds come from the theme)

This guarantees that **any** chart, however unusual, still gets the house title, footer, fonts, colours and export path.

### 3.3 Example: a chart in an analysis repo

Shortened from the Phase 0 test chart [apps/docs/src/lib/charts/budget-bars/Chart.svelte](apps/docs/src/lib/charts/budget-bars/Chart.svelte):

```svelte
<script lang="ts">
	import { scaleBand, scaleLinear } from 'd3-scale';
	import { max, min } from 'd3-array';
	import { Chart, Header, Title, Subtitle, Footer, Source, Notes } from 'mozaic/frame';
	import { Plot, Svg, Html, scaled } from 'mozaic/core';
	import { Bars, Rules } from 'mozaic/marks';
	import { AxisX, AxisY, GridX } from 'mozaic/guides';
	import { Callout } from 'mozaic/annotations';
	import { Tooltip } from 'mozaic/interactive';
	import { createLocale, type LocaleCode } from 'mozaic/locale';
	import { resolveStyle, type StyleName } from 'mozaic/styles';
	import { messages, rows } from './data';

	let { style, locale }: { style: StyleName; locale: LocaleCode } = $props();
	const t = $derived(messages[locale]);
	const fmt = $derived(createLocale(locale));
	const theme = $derived(resolveStyle(style));

	const data = $derived(rows.map((d) => ({ ...d, name: t.sectors[d.id] })).toSorted((a, b) => b.change - a.change));
	const x = $derived(
		scaleLinear()
			.domain([Math.min(0, min(data, (d) => d.change) ?? 0), max(data, (d) => d.change) ?? 1])
			.nice()
	);
	const y = $derived(
		scaleBand<string>()
			.domain(data.map((d) => d.name))
			.paddingInner(0.25)
	);
	let hovered = $state<(typeof data)[number] | null>(null);
</script>

<Chart {style} {locale} alt={t.alt}>
	<Header>
		<Title>{t.title}</Title>
		<Subtitle>{t.subtitle}</Subtitle>
	</Header>

	<Plot {x} {y} height={data.length * 30} padding={{ left: 140, right: 24, top: 4, bottom: 24 }}>
		{#snippet children(plot)}
			<Svg>
				<GridX ticks={5} />
				<AxisX ticks={5} format={fmt.percent} />
				<AxisY />
				<Bars
					{data}
					x={(d) => d.change}
					y={(d) => d.name}
					fill={(d) => (d.change >= 0 ? theme.palettes.semantic.positive : theme.palettes.semantic.negative)}
					onpointerenter={(d) => (hovered = d)}
					onpointerleave={() => (hovered = null)}
				/>
				<Rules x={[0]} />
				<Callout
					x={data[0].change}
					y={data[0].name}
					dx={-6}
					dy={120}
					anchor="end"
					curve="left"
					label={t.callout(fmt.signedPercent(data[0].change))}
				/>
			</Svg>
			<Html>
				{#if hovered}
					<Tooltip x={plot.x(hovered.change) ?? 0} y={scaled(plot.y, hovered.name)}>
						<strong>{hovered.name}</strong><br />{fmt.signedPercent(hovered.change)}
					</Tooltip>
				{/if}
			</Html>
		{/snippet}
	</Plot>

	<Footer>
		<Notes>{t.notes}</Notes>
		<Source>{t.source}</Source>
	</Footer>
</Chart>
```

The code is longer than a grammar spec, but every step is visible and ordinary d3: scales, sorting, the axis and the colours. Colours come from the theme, so the same chart renders in SAMIZDATA or ZDG colours. Text comes from per-locale messages.

### 3.4 The core API

```
<Plot>                       plot area inside <Chart>; owns dimensions and scales
  x, y                       d3 scales without a range, or (dims) => scale for full control
  scales                     extra named scales, e.g. { color: scaleOrdinal(...), r: scaleSqrt(...) }
  xRange, yRange             override the default ranges ([0, width], [height, 0]; band/point y → [0, height])
  projection, fit            a d3-geo projection (or factory), fitted to `fit` GeoJSON; marks use plot.path
  height | aspectRatio       height of the plot area (number or fn of width/breakpoint); width comes from the container
  padding                    object or fn of width/breakpoint; merged over the theme's padding
  children(plot)             snippet receives the plot context, e.g. for tooltip positions
  <Svg>   <Html>   <Canvas>  stacked layers sharing one coordinate system (Canvas: Phase 2)
```

`usePlot()` returns reactive values: `width`, `height`, `padding`, `fullWidth`, `fullHeight`, `measured`, `x`, `y`, `scales`, `projection`, `path`, `medium` and `breakpoint`. `useChart()`, `useTheme()` and `useLocale()` give the frame's style and locale. A mark is just a component that calls `usePlot()` and draws SVG, so writing a new mark looks like this:

```svelte
<!-- marks/Lollipops.svelte -->
<script lang="ts" generics="T">
	import { usePlot, scaled } from 'mozaic/core';
	let {
		data,
		x,
		y,
		r = 4,
		fill = 'currentColor'
	}: { data: T[]; x: (d: T) => number; y: (d: T) => string; r?: number; fill?: string } = $props();
	const plot = usePlot();
</script>

{#each data as d}
	<line x1={plot.x(0)} x2={plot.x(x(d))} y1={scaled(plot.y, y(d))} y2={scaled(plot.y, y(d))} stroke={fill} />
	<circle cx={plot.x(x(d))} cy={scaled(plot.y, y(d))} {r} {fill} />
{/each}
```

`scaled(scale, value)` returns the band centre for band scales, so marks treat all scales alike.

Rules that keep it extensible:

- The core never computes domains, sorts or aggregates data. That happens in the chart file or in `mozaic/transforms`, where it is visible.
- Any mark can be copied into an analysis repo and edited, because no mark depends on internal APIs.
- Anything that must **print** is drawn in `<Svg>`. `<Html>` and `<Canvas>` are for interaction and very large datasets, and need an SVG fallback in print mode.
- Small helpers stay optional: `autoDomain(data, acc, { zero, nice })`, `bandScale(data, acc)`, `labelWidth(labels, font)` (for left padding with long labels).

### 3.5 Designing for AI authors

Most chart code will be written by AI, so the library is built to be easy for a model to use correctly:

- **`AGENTS.md` / `CLAUDE.md` + `llms.txt`** in mozaic and in every analysis repo. They describe the component model, the conventions (§3.4), the styles, and "how to add a new mark".
- **The gallery is the example set.** Every component and recipe has a complete, working example in `apps/docs`. These are the files an AI copies from.
- **TypeScript-typed props with JSDoc** on every component, so editors and models see what is allowed.
- **A Claude Code skill in the analysis template** ("build a mozaic chart"). It covers: read `data/processed`, pick or write marks, use the theme, check `/preview` at every breakpoint and in print, then export.
- **Visual checks AI can run itself.** `just preview-shots` takes Playwright screenshots of every chart × style × breakpoint, so the AI can look at its output and fix it.
- **Prefer explicit over clever.** Plain d3 and plain Svelte over magic props. Verbose code is fine when it is obvious code.

---

## 4. Styles (theming)

### 4.1 Structure

```
src/lib/styles/
  types.ts        Theme type
  base.ts         neutral defaults + extendTheme()
  samizdata.ts    extendTheme({ … }) — fonts/logo assets will sit beside it
  zdg.ts
  index.ts        registry: { base, samizdata, zdg } — add a file and an entry to add a style
```

**CSS tokens** are defined in each theme's `tokens` field (one source of truth, decided in Phase 0) and applied inline on `<Chart>`, which also sets `data-mz-style="zdg"` for any CSS that needs it. Components use them as `var(--mz-…)`. As CSS, the ZDG tokens would read:

```css
[data-mz-style='zdg'] {
	--mz-font-title: 'ZDG Serif', Georgia, serif;
	--mz-font-body: 'ZDG Sans', system-ui, sans-serif;
	--mz-size-title: 1.375rem;
	--mz-color-text: #1a1a1a;
	--mz-color-muted: #6b6b6b;
	--mz-color-grid: #e5e5e5;
	--mz-color-accent: #c8102e;
	/* … */
}
```

**JS theme** carries anything that scales, marks and formats need as values:

```ts
export const zdg: Theme = {
	name: 'zdg',
	palettes: {
		categorical: ['#c8102e', '#1f4e79', '#e8a33d', '#5b8c5a', '#7a5195', '#999999'],
		sequential: 'interpolateReds',
		diverging: ['#1f4e79', '#f2f2f2', '#c8102e'],
		semantic: { positive: '#2e7d32', negative: '#c8102e', neutral: '#999999', highlight: '#c8102e', context: '#cccccc' }
	},
	plot: { padding: { top: 8, right: 16, bottom: 24, left: 8 }, grid: 'x', axisLine: false, tickSize: 0, ticks: 5 }, // defaults read by Plot, guides and marks
	breakpoints: { s: 0, m: 480, l: 720 },
	print: { widths: { column: 55, double: 115, page: 180 }, unit: 'mm', baseFontPt: 7.5 },
	logo: { src: logoUrl, position: 'footer-right' },
	defaultLocale: 'ro'
};
```

Our own components read these defaults with `useTheme()`, so there is no adapter layer. Any prop passed to a component overrides the theme default.

### 4.2 Media variants

- **web**: responsive, interactive, CSS fonts.
- **print**: fixed physical size (mm, from `theme.print.widths`), pt-based type scale, no hover UI, optional greyscale-safe palette, and a `print.css` override.
- Optional **dark** token set per style, for sites that need it.

### 4.3 Locales

Locale is set separately from style. A ZDG chart may run in Romanian **and** Russian, and a SAMIZDATA chart in English.

- `mozaic/locale` provides `d3-format` / `d3-time-format` locale definitions for `ro-RO`, `ru-RU` and `en-GB` (more as needed), with correct decimal and thousands separators and month names.
- Chart text lives in per-chart message files (`messages/ro.json`, `messages/ru.json`). The build generates **one embed per locale**.

---

## 5. Component inventory

### Frame

`Chart`, `Header`, `Title`, `Subtitle`, `Footer`, `Source`, `Notes`, `Byline`, `Logo`, `Credits`, `DataDownload` (link to the CSV), `AltText` / screen-reader description, `ShowTableToggle` (a11y data table).

### Guides

`AxisX`, `AxisY` (ticks, format, tick labels inside or outside, optional axis title), `GridX`, `GridY`, `Legend` (swatches / line / dot), `ColorRamp`, `SizeLegend`, `InlineLegend` (legend items placed in the subtitle, e.g. "**Men** and **women**" coloured by series). House defaults come from the theme.

### Annotations

`Callout` (text + optional curved arrow), `Arrow`, `RefLine`, `RefBand`, `HighlightRange`, `PointLabel`, `LineEndLabels`, `Note` (numbered marker → footer note). All take `x`/`y` in data space, `dx`/`dy` in pixels, and an optional `at={{ s: {...}, l: {...} }}` per-breakpoint override.

**Later:** a dev-only "annotation editor" mode (drag handles, as in swoopy-drag) that writes positions back to `annotations.json` through a Vite dev-server endpoint.

### Marks

- **Basic:** `Bars` (horizontal or vertical, from the scales), `Line`, `Area`, `Points`, `Rules`, `Rects`, `Text`, `Arcs`, `Path`, `GeoPath`, `Voronoi` (hover targets).
- **Compound:** `Treemap` (d3-hierarchy squarify), `Waffle`, `Beeswarm`, `Dumbbell`, `Slope`, `Sparkline`, `LineEndLabels`, `Hexbin` (if needed), `Sankey` (d3-sankey, later).
- **Layout:** `Facets` (small multiples with shared or free scales).

### Tables

`Table`: sortable columns, column formatters from the locale, inline bars / sparklines / heat cells, sticky header, optional search and pagination, and a print layout.

### Maps

- `<Plot projection={…} fit={features}>`: the plot context then holds a `d3-geo` projection (fitted to the features and the container) and a `path` generator. `GeoPath` uses it; `Points` and `Text` will too. It supports choropleths, proportional symbols, labels, insets and projection presets (Moldova uses a conformal projection centred on 28.5°E 47°N).
- Bundled boundary data (simplified TopoJSON, attributions in the footer): Moldova raions, municipalities and ATU Gagauzia (needed for ZDG), and world/Europe countries. Data is loaded on demand, not bundled into every embed.
- `MapLibreMap` for zoomable or tile maps: PMTiles basemap styled per house style, data layers added as Svelte children, and a static SVG fallback for print.

### Interactive

`Tooltip` (theme-styled, follows the pointer, touch-friendly), `Toggle` / `ButtonGroup` (switch series or views), `Scroller` (sticky graphic + steps with `index`/`progress` bindings, honours `prefers-reduced-motion`), and transitions using Svelte `tweened`/`Spring`.

---

## 6. Repository layout (mozaic)

```
mozaic/
├── packages/
│   ├── mozaic/                    # the library (single package, subpath exports)
│   │   ├── src/lib/
│   │   │   ├── core/ transforms/ marks/ guides/ annotations/
│   │   │   ├── frame/ recipes/
│   │   │   ├── table/ maps/ scrolly/ interactive/
│   │   │   ├── styles/ locale/
│   │   │   ├── embed/             # iframe resizer (child + host scripts)
│   │   │   └── export/            # SVG serialisation helpers (used by CLI)
│   │   └── package.json           # exports: "mozaic/frame", "mozaic/styles/zdg", …
│   ├── cli/                       # `mozaic` CLI: export, eject, new
│   └── create-mozaic/             # `pnpm create mozaic` → scaffolds an analysis repo
├── apps/
│   └── docs/                      # SvelteKit: gallery, component docs, style switcher
├── templates/
│   └── analysis/                  # source of truth for the scaffolder
├── tests/visual/                  # Playwright screenshots: every gallery chart × style × breakpoint
├── AGENTS.md / llms.txt           # how AI should use and extend mozaic (§3.5)
├── PLAN.md
└── pnpm-workspace.yaml
```

Start with **one** library package. Split it (e.g. `@mozaic/maps`, so MapLibre stays out of simple embeds) only if bundle size or dependency weight calls for it. Subpath exports plus tree-shaking already keep embeds lean.

---

## 7. Analysis repo workflow

### 7.1 Scaffold

```bash
pnpm create mozaic moldova-budget-2026 --style zdg --locales ro,ru
```

This produces:

```
moldova-budget-2026/
├── analysis/
│   ├── R/            01_clean.R, 02_model.R      (renv.lock)
│   └── py/           clean.py                    (pyproject.toml, uv.lock)
├── data/
│   ├── raw/          (git-ignored or LFS)
│   └── processed/    budget_change.csv           ← the contract between analysis and charts
├── src/
│   ├── charts/
│   │   └── budget-change/
│   │       ├── Chart.svelte
│   │       ├── data.ts           (load + type + derive)
│   │       ├── messages/ro.json, ru.json
│   │       └── chart.config.ts   (slug, styles, locales, print sizes, fallback image)
│   └── routes/                   (generated: /embed/[chart]/[locale], /preview)
├── .claude/skills/mozaic-chart/  (how to build a chart in this repo)
├── AGENTS.md
├── justfile
└── mozaic.config.ts              (project slug, deploy target, default style)
```

### 7.2 Data contract

- R/Python write **tidy, long-format** CSV (or JSON / Parquet for large data) into `data/processed/`. This mirrors ggplot.
- `data.ts` reads it at build time (`d3-dsv` with typed parsing) and runs a schema check (`valibot`/`zod`) so the build fails loudly if the analysis output changes shape.
- Data is inlined into the prerendered page or emitted as a hashed sibling JSON, so embeds have no runtime dependencies.

### 7.3 Commands (`justfile`)

```
just data       # run R/Python pipeline → data/processed
just dev        # SvelteKit dev server with /preview: all charts × styles × locales × breakpoints
just build      # static build → dist/embed/...
just export     # Playwright → dist/print/*.svg|pdf|png and social PNGs
just deploy     # upload dist/ to the embed host
just all        # data → build → export
```

### 7.4 Developing library features from an analysis repo

When a story needs a new chart type or component feature:

1. Work in `mozaic` with the analysis repo linked (`pnpm link ../mozaic/packages/mozaic`), so changes hot-reload in both.
2. Add a gallery example and a visual test in `mozaic/apps/docs`.
3. Add a changeset, release, and bump the pinned version in the analysis repo.

Ejected recipes that turn out to be generally useful are promoted back into `mozaic/recipes` the same way.

---

## 8. Embed pipeline

### 8.1 Output

```
dist/
├── embed/
│   └── budget-change/
│       ├── ro/index.html          # prerendered SVG + hydration JS + CSS + fonts
│       ├── ru/index.html
│       └── fallback.png           # for noscript / social / RSS
├── print/
│   └── budget-change/ro/{column,double,page}.{svg,pdf}, @2x.png
└── embed.js                        # host-side resizer (also hosted centrally)
```

- Each embed page is **fully static**. It renders without JS (prerendered SVG) and hydrates for interactivity.
- Asset paths are relative and hashed, so the folder can be uploaded anywhere.
- Fonts are self-hosted per style. Check each font licence for web embedding (see open questions).

### 8.2 Embedding

The snippet to paste into WordPress or another CMS:

```html
<iframe
	src="https://charts.example.com/moldova-budget-2026/budget-change/ro/"
	title="Health spending rose the most"
	data-mozaic
	style="width:100%;border:0"
	scrolling="no"
	loading="lazy"
	height="480"
></iframe>
<script src="https://charts.example.com/embed.js" async></script>
```

- The chart page posts its height with `postMessage` on every resize. `embed.js` listens and sets the iframe height, checking the message origin and matching it to the iframe. The protocol is compatible with Datawrapper's, so a site that already has that listener works too.
- `/preview` and the docs site generate the snippet automatically (a "Copy embed code" button).
- Optional later: a **web component build** (`<mozaic-chart>`) for inline embedding where iframes are unwelcome. Shadow DOM keeps styles isolated.

### 8.3 Hosting

One static host for all projects, e.g. `charts.nicu.md/<project>/<chart>/<locale>/`, on Cloudflare Pages, Netlify or S3+CloudFront. CI in each analysis repo runs `just build export` and uploads to its own project prefix. Embeds are **immutable snapshots**: upgrading mozaic never alters a published chart unless you rebuild it on purpose.

---

## 9. Print export

`mozaic export` (in `packages/cli`) does the following:

1. Starts a static server on `dist/`.
2. For each chart × locale × print size, opens `/embed/<chart>/<locale>/?medium=print&width=<mm>` in Playwright. `<Chart>` then switches to fixed physical dimensions and print tokens.
3. **SVG**: serialises the chart's root `<svg>`, folding the header and footer into it (in print mode `<Chart>` renders title and footer as SVG `<text>`, not HTML). It inlines computed styles, removes interaction-only elements, and sets `width`/`height` in mm with the correct `viewBox`.
4. **PDF**: `page.pdf()` at the exact physical size (vector).
5. **PNG**: screenshots at 2× for web fallbacks and social cards (1200×675 with a social layout variant).

Notes:

- SVG keeps text as live `<text>` so it can be edited in Illustrator or InDesign. A `--outline-text` option (via Inkscape CLI or `opentype.js`) is available when the designer lacks the fonts.
- CMYK and PDF/X conversion are out of scope at first. Print palettes are chosen to survive conversion, and the print designer handles colour management. This can be revisited (Ghostscript) if the papers need it.

---

## 10. Quality, testing and docs

- **Docs/gallery** (`apps/docs`): every component and recipe has a live example with a style switcher (SAMIZDATA / ZDG), a locale switcher and a width slider. The gallery doubles as the visual test suite.
- **Visual regression**: Playwright screenshots of each gallery entry × style × {mobile, desktop, print}, committed as baselines. A change to a style shows up as a reviewable diff.
- **Unit tests** (Vitest): formatters, locale definitions, layout utilities (label collision, treemap), and the embed resize protocol.
- **Accessibility**: `role="img"` + `aria-labelledby` (title) + `aria-describedby` (alt text) on charts, a keyboard-reachable data table toggle, sufficient colour contrast checked per palette in tests, and reduced-motion support.
- **Bundle budget**: CI fails if a simple bar-chart embed grows past ~60 kB gzipped JS (number to be tuned in Phase 3).
- **Releases**: Changesets → semver tags → publish to npm (public or GitHub Packages). Analysis repos pin exact versions.

---

## 11. Roadmap

### Status (2026-10-25)

Phases 0–4 and most of 5–6 are built. The SAMIZDATA style uses the SAMIZDATA brand system and the ZdG style the zdg.md site design (fonts, colours, logos). See [README.md](README.md) and the docs site for what exists.

**Done:** core (`Plot`, `Svg`, `Html`, `Canvas`, `Facets`); frame incl. byline, data table and CSV download; 16 marks; 8 guides; 5 annotations; `Table` and `Sparkline`; transforms; styles with print tokens; en/ro/ru; embeds with auto-resize, manifest and `embed.js`; `figureToSvg`; `mozaic export` (SVG, PDF, PNG) and `mozaic eject`; four recipes; `create-mozaic` with the analysis template, preview page and GitHub Pages workflow; docs site with 11 guides, generated API reference, 20 gallery examples and `llms.txt`; ~180 tests (unit, server-render, gallery, headline-vs-data, CLI with a real export, Playwright e2e, axe accessibility, visual baselines); ESLint, Prettier, CI, Changesets.

**Changed from the plan:**

- House styles moved out of the library (2026-11-03, [ADR 0002](docs/adr/0002-house-styles-outside.md)): mozaic ships only `base`; SAMIZDATA and ZdG live in their brand repositories, Plebiscit.md in its own. Earlier sections that describe built-in `samizdata` and `zdg` styles are historical.
- Style tokens live in each theme's TypeScript and are applied inline on `<Chart>` (no separate CSS files).
- Maps use `<Plot projection={…} fit={…}>` rather than a separate `GeoPlot`.
- `Bars` covers both orientations, stacking (`base`) and grouping (`group`); there is no separate `Columns` mark.
- No generic `Path` mark: raw SVG with `usePlot()` scales does that job.
- Print SVG export converts the HTML header and footer to SVG text in the browser (`figureToSvg`) instead of rendering them as SVG in print mode.
- The template lives in `packages/create-mozaic/template` (not a root `templates/` folder).

**Not done yet:**

- Fix the colour-blind separation of the SAMIZDATA brand palette at the brand source (raspberry/teal, ΔE 5.3) and agree a chart palette with ZdG (mozaic's is derived from the site).
- Ship one real chart to zdg.md or samizdata.co.
- The "AI writes a fourth chart from the docs alone" check from Phase 0.
- `MapLibreMap` with PMTiles basemaps; Europe and world boundaries; map insets.
- A scrolly-story template in `create-mozaic`; the dev-mode annotation editor.
- Dark-mode chart tokens; a `<mozaic-chart>` web component build; CMYK/PDF-X output.
- Publishing the packages to a registry.

### Phase 0: Core spike (≈1 week) — done 2026-10-25, see [ADR 0001](docs/adr/0001-chart-core.md); the AI-written fourth chart is still to do

- Write the core: `Chart` (bare), `Plot`, `Svg`/`Html` layers, `usePlot()`, plus `AxisX`/`AxisY`/`GridX`, `Bars`, `Line`, `Text`, `GeoPath`.
- Use it to build three test charts: (a) a sorted bar chart with a curved-arrow callout, (b) a multi-line chart with direct labels and a tooltip, (c) a Moldova raion choropleth.
- Have AI write a fourth chart type (e.g. a slope chart) from the docs alone, to check that the model is easy to learn.
- Check: SSR/prerender output, resize behaviour, and SVG export fidelity.
- **Exit criterion:** the core holds up, or we fall back to Layer Cake. Record the decision in `docs/adr/0001-chart-core.md`.

### Phase 1: Foundations

- Monorepo, tooling, CI, docs app skeleton, `AGENTS.md` / `llms.txt`.
- Theme system (tokens + JS theme + `useTheme()`), `samizdata` and `zdg` styles with fonts and logos.
- `mozaic/locale` (en, ro, ru).
- Frame components: `Chart`, header, footer, source, notes, logo, alt text.

### Phase 2: Core chart vocabulary

- Remaining basic marks (`Area`, `Points`, `Rules`, `Rects`, `Arcs`, `Path`, `Voronoi`), `Canvas` layer, `Facets`.
- `mozaic/transforms` (stack, bin, rollup, normalise, dodge, labelAvoid).
- Guides (legends, colour ramp, inline legend).
- Annotations (`Callout`, `Arrow`, `RefLine`, `RefBand`, `LineEndLabels`, `PointLabel`).
- Recipes: bar (h/v, grouped, stacked), line, area, scatter, dot plot, small multiples.
- Marks: `Treemap`, `Waffle`, `Dumbbell`, `Slope`, `Sparkline`.
- `Table` component.
- `Tooltip`, `ButtonGroup`.
- Gallery entries + visual baselines for all of the above.

### Phase 3: Embed pipeline and first real story

- `templates/analysis` + `create-mozaic`.
- Route generation per chart × locale, `/preview` page, embed resize protocol + `embed.js`.
- Deploy pipeline to the embed host.
- **Ship one real chart** to zdg.md or samizdata.co to validate the workflow end to end.

### Phase 4: Print and export

- Print medium in `<Chart>` (SVG header/footer, mm sizing, print tokens).
- `mozaic export` (SVG, PDF, PNG, social card).
- `mozaic eject`.

### Phase 5: Maps

- Geo helpers, projection presets, Moldova + Europe + world boundaries.
- Choropleth / symbol map recipes, map legends, insets.
- `MapLibreMap` + PMTiles basemaps styled per house style, with print fallback.

### Phase 6: Scrollytelling and richer interaction

- `Scroller`, step-driven transitions between chart states, a mobile-first layout.
- A scrolly story template in `create-mozaic` (a full-page embed rather than a single chart).
- Dev-mode annotation editor.

### Ongoing

- Add chart types and features as stories need them (§7.4).
- Add new client styles as `styles/<client>/` folders.

---

## 12. Open questions

1. **Fonts and brand guides.** Which typefaces do SAMIZDATA and ZDG use, and do the licences allow self-hosted web embedding and PDF embedding? Is there a brand guide or style sheet for each?
2. **Languages.** Is samizdata.co English-only? Does ZDG need RO + RU for every chart, or only some?
3. **Embed host and domain.** Where should embeds live (e.g. `charts.nicu.md`, or a subdomain per client)? Do clients need embeds on their own domain?
4. **CMS constraints.** Are both sites on WordPress? Are iframes and external scripts allowed in posts, or is a script-free iframe (fixed or aspect-ratio height) needed as a fallback?
5. **Print requirements.** Who receives the print files, and do they need PDF/X or CMYK, outlined text, or specific column widths?
6. **Distribution.** Publish `mozaic` publicly on npm, or keep it private (GitHub Packages / git dependency)?
7. **Analytics.** Do embeds need view tracking, and is a privacy-friendly option (e.g. Plausible) acceptable?
