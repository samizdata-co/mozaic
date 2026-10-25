<!--
@component
A filled area between `y0` (default 0) and `y` along x. For stacked areas,
use `stack()` and pass `y0={d => d.start}` and `y={d => d.end}` per series.
Pair a light area (opacity ~0.1–0.2) with a `<Line>` on top for emphasis.
-->
<script lang="ts" generics="T">
	import { area, curveLinear, type CurveFactory } from 'd3-shape';
	import { useChart, usePlot } from '../core/context.js';
	import { scaled } from '../core/scales.js';
	import { access, type Accessor } from '../core/accessor.js';

	interface Props {
		data: T[];
		x: (d: T, i: number) => any;
		/** Top edge. */
		y: (d: T, i: number) => any;
		/** Bottom edge (value, or function for stacks). */
		y0?: Accessor<T, number>;
		curve?: CurveFactory;
		defined?: (d: T, i: number) => boolean;
		fill?: string;
		opacity?: number;
		class?: string;
	}

	let { data, x, y, y0 = 0, curve = curveLinear, defined, fill, opacity = 1, class: className = '' }: Props = $props();

	const chart = useChart();
	const plot = usePlot();

	const d = $derived(
		area<T>()
			.x((p, i) => scaled(plot.x, x(p, i)))
			.y1((p, i) => scaled(plot.y, y(p, i)))
			.y0((p, i) => scaled(plot.y, access(y0, p, i)))
			.defined((p, i) =>
				defined ? defined(p, i) : Number.isFinite(scaled(plot.x, x(p, i))) && Number.isFinite(scaled(plot.y, y(p, i)))
			)
			.curve(curve)(data) ?? ''
	);
</script>

<path class="mz-area {className}" {d} fill={fill ?? chart.theme.palettes.categorical[0]} fill-opacity={opacity} />
