<!--
@component
The plot area. Measures its width, applies padding, sets the ranges of the
d3 scales you pass in, and shares everything with its layers and marks via
`usePlot()`. Put `<Svg>`, `<Html>` (and later `<Canvas>`) layers inside.

```svelte
<Plot x={scaleLinear().domain([0, 100])} y={scaleBand().domain(names)} height={300}>
  <Svg>…marks…</Svg>
  <Html>…tooltips…</Html>
</Plot>
```

The children snippet receives the plot context, so chart code can use the
ranged scales directly (e.g. to position a tooltip):

```svelte
<Plot {x} {y}>
  {#snippet children(plot)}
    <Html><Tooltip x={plot.x(d.value)} y={scaled(plot.y, d.name)}>…</Tooltip></Html>
  {/snippet}
</Plot>
```
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { scaleIdentity } from 'd3-scale';
	import { geoPath, type GeoPermissibleObjects } from 'd3-geo';
	import { setPlotContext, useChart, useInitialWidth } from './context.js';
	import { isOrdinal, isScale } from './scales.js';
	import type {
		Breakpoint,
		Dimensions,
		Padding,
		PlotContext,
		PositionScale,
		ProjectionInput,
		RangeInput,
		ScaleInput
	} from './types.js';

	type SizeInfo = { width: number; breakpoint: Breakpoint };

	interface Props {
		/** x position scale: a d3 scale without a range (Plot sets it), or `(dims) => scale` for full control. */
		x?: ScaleInput;
		/** y position scale. Continuous scales get range [height, 0]; band/point scales get [0, height]. */
		y?: ScaleInput;
		/** Override the default x range. */
		xRange?: RangeInput;
		/** Override the default y range. */
		yRange?: RangeInput;
		/** Extra named scales, e.g. `{ color: scaleOrdinal(...) }`. Plain functions are called with the dimensions. */
		scales?: Record<string, unknown>;
		/** A d3-geo projection, or `(dims) => projection`. */
		projection?: ProjectionInput;
		/** GeoJSON to fit the projection to the plot area. */
		fit?: GeoPermissibleObjects;
		/** Plot-area height in px, or a function of the outer width and breakpoint. */
		height?: number | ((size: SizeInfo) => number);
		/** Plot-area width / height. Used when `height` is not given. */
		aspectRatio?: number;
		/** Space around the plot area for axes and labels. Merged over the theme's padding. */
		padding?: Partial<Padding> | ((size: SizeInfo) => Partial<Padding>);
		/** Fixed outer width in px (print, tests). Otherwise the container is measured. */
		width?: number;
		class?: string;
		/** Receives the plot context (ranged scales, dimensions). */
		children?: Snippet<[PlotContext]>;
	}

	let {
		x: xInput,
		y: yInput,
		xRange,
		yRange,
		scales: scaleInputs = {},
		projection: projectionInput,
		fit,
		height: heightInput,
		aspectRatio,
		padding: paddingInput = {},
		width: fixedWidth,
		class: className = '',
		children
	}: Props = $props();

	const chart = useChart();
	const initialWidth = useInitialWidth();

	let measuredWidth = $state(0);
	const measured = $derived(fixedWidth != null || measuredWidth > 0);
	const fullWidth = $derived(fixedWidth ?? (measuredWidth || initialWidth?.() || chart.width));
	const size = $derived<SizeInfo>({ width: fullWidth, breakpoint: chart.breakpoint });

	const padding = $derived<Padding>({
		...chart.theme.plot.padding,
		...(typeof paddingInput === 'function' ? paddingInput(size) : paddingInput)
	});
	const width = $derived(Math.max(0, fullWidth - padding.left - padding.right));
	const height = $derived(
		Math.max(
			0,
			typeof heightInput === 'function'
				? heightInput(size)
				: (heightInput ?? (aspectRatio ? width / aspectRatio : chart.theme.plot.height))
		)
	);
	const fullHeight = $derived(height + padding.top + padding.bottom);
	const dims = $derived<Dimensions>({ width, height, padding, fullWidth, fullHeight, breakpoint: chart.breakpoint });

	function resolveRange(input: RangeInput | undefined, fallback: [number, number]): [number, number] {
		if (!input) return fallback;
		return typeof input === 'function' ? input(dims) : input;
	}

	function resolveScale(input: ScaleInput | undefined, range: [number, number]): PositionScale {
		if (!input) return scaleIdentity().range(range) as unknown as PositionScale;
		if (isScale(input)) return input.copy().range(range);
		return input(dims);
	}

	const x = $derived(resolveScale(xInput, resolveRange(xRange, [0, width])));
	const y = $derived(resolveScale(yInput, resolveRange(yRange, isOrdinal(yInput) ? [0, height] : [height, 0])));

	const scales = $derived(
		Object.fromEntries(
			Object.entries(scaleInputs).map(([name, s]) => [
				name,
				typeof s === 'function' && !isScale(s) ? (s as (d: Dimensions) => unknown)(dims) : s
			])
		)
	);

	const geo = $derived.by(() => {
		if (!projectionInput) return { projection: undefined, path: undefined };
		const projection = 'scale' in projectionInput ? projectionInput : projectionInput(dims);
		if (fit) projection.fitSize([width, height], fit);
		// A new geoPath on every change so dependants re-render (the projection object is mutated in place).
		return { projection, path: geoPath(projection) };
	});

	const context: PlotContext = {
		get width() {
			return width;
		},
		get height() {
			return height;
		},
		get padding() {
			return padding;
		},
		get fullWidth() {
			return fullWidth;
		},
		get fullHeight() {
			return fullHeight;
		},
		get measured() {
			return measured;
		},
		get breakpoint() {
			return chart.breakpoint;
		},
		get medium() {
			return chart.medium;
		},
		get x() {
			return x;
		},
		get y() {
			return y;
		},
		get scales() {
			return scales;
		},
		get projection() {
			return geo.projection;
		},
		get path() {
			return geo.path;
		}
	};
	setPlotContext(context);
</script>

<div
	class="mz-plot {className}"
	bind:clientWidth={measuredWidth}
	style:width={fixedWidth != null ? `${fixedWidth}px` : undefined}
	style:height={measured ? `${fullHeight}px` : undefined}
	style:aspect-ratio={measured ? undefined : `${fullWidth} / ${fullHeight}`}
>
	{@render children?.(context)}
</div>

<style>
	.mz-plot {
		position: relative;
		width: 100%;
	}
</style>
