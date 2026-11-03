<!-- section: Start -->

# Concepts

mozaic keeps the ideas of the grammar of graphics (data → scales → marks → guides) without a grammar engine. Scales are ordinary d3 scales, marks are ordinary Svelte components, and nothing is hidden: any piece can be copied and changed.

## The pieces

```svelte
<Chart style={theme} locale="en" alt="…">
	← frame: style, language, width, title, footer
	<Header>…</Header>
	<Plot x={xScale} y={yScale} height={300}>
		← plot area: size, padding, scale ranges
		<Svg>
			← layer: plot-area coordinates
			<GridY />
			<AxisX />
			<AxisY /> ← guides
			<Line … />
			<Points … /> ← marks
			<Callout … /> ← annotations
		</Svg>
		<Html><Tooltip … /></Html> ← interactive layer (not printed)
	</Plot>
	<Footer>…</Footer>
</Chart>
```

| ggplot                 | mozaic                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------- |
| `data` + `aes()`       | `data` prop + accessor props (`x={(d) => d.year}`)                                    |
| `scale_*`              | d3 scales passed to `<Plot>` (`x`, `y`, `scales`)                                     |
| `geom_*`               | marks (`Bars`, `Line`, `Area`, `Points`, `Rects`, `Text`, `GeoPath`, …)               |
| `stat_*`, `position_*` | functions in `mozaic/transforms` (`stack`, `bin`, `rollup`, `dodge`, `treemapLayout`) |
| `facet_*`              | `<Facets>`                                                                            |
| `theme()`              | house styles                                                                          |
| `annotate()`           | `mozaic/annotations`                                                                  |

## Chart

`<Chart>` applies a house style (its tokens become CSS custom properties), picks a locale (number and date formats, UI strings), measures its width to pick a breakpoint (`s`, `m`, `l`), and shares all of this through `useChart()`, `useTheme()` and `useLocale()`.

It does not care what is inside. A mozaic `<Plot>`, hand-written SVG, a `<Table>`, a map or another library's output all get the same frame, fonts and export path.

Props: `style`, `locale`, `medium` (`'web'` or `'print'`), `width` (fixed px; otherwise it fills its container) and `alt` (a screen-reader description of what the chart shows).

## Plot and scales

`<Plot>` is the plot area. You pass d3 scales **without a range**; Plot measures its width, subtracts the padding and sets the ranges:

- `x` gets `[0, width]`.
- `y` gets `[height, 0]` for continuous scales (up is bigger) and `[0, height]` for band and point scales (first category at the top).

```svelte
<Plot x={scaleTime().domain([start, end])} y={scaleLinear().domain([0, 100]).nice()} height={300} padding={{ left: 40 }}>
```

You always set the **domain** yourself, in the chart file, where it is visible. Plot never sorts, aggregates or guesses.

For full control, pass a factory instead of a scale: `x={(dims) => scaleLinear().domain([0, 1]).range([dims.width, 0])}`. Override just the range with `xRange` / `yRange`. Extra scales (colour, radius) go in `scales={{ color, r }}`.

`height` can be a number or a function of the width and breakpoint, `(size) => size.breakpoint === 's' ? 240 : 320`; `aspectRatio` is an alternative. `padding` merges over the theme's padding and can also be a function of the size.

For maps, pass a d3-geo `projection` and `fit` (a GeoJSON object to fit inside the plot area). Marks then take longitude and latitude as `x` and `y`.

## Layers

- `<Svg>` draws in plot-area coordinates (the padding is already applied). Anything that must print goes here.
- `<Html>` sits exactly over the plot area, for tooltips. It is not rendered in print and not exported.
- `<Canvas draw={(ctx, plot) => …}>` is for thousands of points. It does not print, so draw an SVG fallback when `plot.medium === 'print'` (see the [canvas example](../../gallery/canvas-scatter/)).

## The plot context

`usePlot()` (inside a Plot) and the `children` snippet of `<Plot>` give you the same reactive object:

```ts
(plot.width, plot.height); // plot area, px
(plot.padding, plot.fullWidth, plot.fullHeight);
(plot.x, plot.y); // the ranged scales
plot.scales; // extra named scales
(plot.projection, plot.path); // with a projection
(plot.breakpoint, plot.medium);
```

Use the snippet form when chart code needs pixel positions, e.g. for a tooltip:

```svelte
<Plot {x} {y}>
	{#snippet children(plot)}
		<Svg>…</Svg>
		<Html>
			{#if hovered}<Tooltip x={plot.x(hovered.value)} y={scaled(plot.y, hovered.name)}>…</Tooltip>{/if}
		</Html>
	{/snippet}
</Plot>
```

`scaled(scale, value)` returns the centre of the band for band scales, so the same code works for any scale. `position(plot, x, y)` also handles projections.

## Marks

Marks take `data` and accessors. Accessors can be functions `(d, i) => value` or constants. Common props: `fill`, `opacity`, `title` (an SVG tooltip for screen readers), and `onpointerenter` / `onpointerleave` / `onclick`, which receive the datum.

- Basic: `Bars` (horizontal or vertical from the scales; stacked with `base`, grouped with `group`), `Line`, `Area`, `Points`, `Rects`, `Arcs`, `Text`, `Rules`, `GeoPath`, `Voronoi` (hover cells).
- Compound: `LineEndLabels`, `Treemap`, `Waffle`, `Dumbbell`, `Arrows`, `Slope`, `Beeswarm`.

When no mark fits, write SVG directly with `usePlot()`. See [Writing marks](../writing-marks/).

## Transforms

Data preparation happens before data reaches a mark, in plain functions:

```ts
import { stack, bin, groupBy, rollup, indexTo, dodge, treemapLayout, avoidOverlap } from 'mozaic/transforms';

const segments = stack(rows, { key: (d) => d.year, series: (d) => d.source, value: (d) => d.twh, offset: 'expand' });
// → [{ key, series, value, start, end, datum }]  →  <Bars x={(d) => d.key} y={(d) => d.end} base={(d) => d.start} />
```

## Guides and annotations

`AxisX`, `AxisY` (with `inside` labels for small screens), `GridX`, `GridY`, `Legend` (items, or an ordinal or threshold scale), `ColorRamp` (continuous scales), `SizeLegend` and `Key` (an inline legend entry inside text).

Annotations: `Callout` (text with a curved arrow), `Arrow`, `Label`, `RefLine` and `RefBand`.

## Small multiples

`<Facets groups={…} columns={{ s: 2, m: 3 }}>` lays out one cell per group. Build the scales once from all the data and pass the same scales to every cell, so the panels are comparable.

## Recipes

Recipes are complete charts with sensible defaults: `BarChart`, `ColumnChart`, `LineChart`, `ScatterChart`, `ArrowChart` (an arrow plot: how each row changed between two dates), `BarDotChart` (bars for the latest value with a dot for an earlier one and the change written beside them), `StackedBarChart` (100% stacked bars, with optional brackets grouping series and a reference line) and `MosaicChart` (a Marimekko chart: 100% stacked bars as tall as their totals, so each cell’s area is its value) from `mozaic/recipes`. Each takes the data, accessors and the frame text, plus an `annotations` snippet for extra SVG.

When you need to change more than the props allow, run `mozaic eject BarChart`. It copies the recipe's source into `src/lib/recipes/` with imports rewritten, and you edit it like any other file.

## Responsive design

Width comes from the container. Use breakpoints for layout changes: shorter plots, fewer ticks, labels above bars, axis labels inside the plot. The [bar example](../../gallery/budget-bars/) shows a full mobile layout. Check every chart at 320 px.
