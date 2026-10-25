<!--
@component
One line through `data` (one series). For several series, render one
`<Line>` per series. Points where `defined` is false leave a gap.
-->
<script lang="ts" generics="T">
	import { curveLinear, line, type CurveFactory } from 'd3-shape';
	import { useChart, usePlot } from '../core/context.js';
	import { scaled } from '../core/scales.js';

	interface Props {
		data: T[];
		x: (d: T, i: number) => any;
		y: (d: T, i: number) => any;
		/** d3 curve factory, e.g. `curveMonotoneX`. */
		curve?: CurveFactory;
		/** Points to skip. Defaults to points with a non-finite position. */
		defined?: (d: T, i: number) => boolean;
		stroke?: string;
		strokeWidth?: number;
		/** SVG dash array, e.g. "4 3" for projections. */
		dash?: string;
		opacity?: number;
		class?: string;
	}

	let {
		data,
		x,
		y,
		curve = curveLinear,
		defined,
		stroke,
		strokeWidth,
		dash,
		opacity = 1,
		class: className = ''
	}: Props = $props();

	const chart = useChart();
	const plot = usePlot();

	const d = $derived(
		line<T>()
			.x((p, i) => scaled(plot.x, x(p, i)))
			.y((p, i) => scaled(plot.y, y(p, i)))
			.defined((p, i) =>
				defined ? defined(p, i) : Number.isFinite(scaled(plot.x, x(p, i))) && Number.isFinite(scaled(plot.y, y(p, i)))
			)
			.curve(curve)(data) ?? ''
	);
</script>

<path
	class="mz-line {className}"
	{d}
	fill="none"
	stroke={stroke ?? chart.theme.palettes.categorical[0]}
	stroke-width={strokeWidth ?? chart.theme.plot.lineWidth}
	stroke-dasharray={dash}
	stroke-opacity={opacity}
	stroke-linejoin="round"
	stroke-linecap="round"
/>
