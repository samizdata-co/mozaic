<!--
@component
Rectangles in data space: heatmap cells, histogram bars, highlighted ranges.
On a band scale, omit `x2`/`y2` and the rectangle spans the band; on a
continuous scale, give both edges (`x` and `x2`).
-->
<script lang="ts" generics="T">
	import { useChart, usePlot } from '../core/context.js';
	import { access, type Accessor, type Value } from '../core/accessor.js';
	import type { PositionScale } from '../core/types.js';

	interface Props {
		data: T[];
		x: Accessor<T, Value>;
		x2?: Accessor<T, Value>;
		y: Accessor<T, Value>;
		y2?: Accessor<T, Value>;
		/** Shrink each rectangle by this many px on every side. */
		inset?: number;
		rx?: number;
		fill?: Accessor<T, string>;
		opacity?: Accessor<T, number>;
		stroke?: string;
		title?: (d: T) => string;
		onpointerenter?: (d: T, event: PointerEvent) => void;
		onpointerleave?: (d: T, event: PointerEvent) => void;
		onclick?: (d: T, event: MouseEvent) => void;
		class?: string;
	}

	let {
		data,
		x,
		x2,
		y,
		y2,
		inset = 0,
		rx = 0,
		fill,
		opacity = 1,
		stroke,
		title,
		onpointerenter,
		onpointerleave,
		onclick,
		class: className = ''
	}: Props = $props();

	const chart = useChart();
	const plot = usePlot();

	function span(scale: PositionScale, a: Value, b: Value | undefined): [number, number] {
		const p = scale(a) ?? NaN;
		if (b === undefined) return [p, p + (scale.bandwidth?.() ?? 0)];
		const q = scale(b) ?? NaN;
		return [Math.min(p, q), Math.max(p, q)];
	}

	const rects = $derived(
		data.map((d, i) => {
			const [x0, x1] = span(plot.x, access(x, d, i), x2 === undefined ? undefined : access(x2, d, i));
			const [y0, y1] = span(plot.y, access(y, d, i), y2 === undefined ? undefined : access(y2, d, i));
			return {
				d,
				x: x0 + inset,
				y: y0 + inset,
				width: Math.max(0, x1 - x0 - inset * 2),
				height: Math.max(0, y1 - y0 - inset * 2)
			};
		})
	);
	const defaultFill = $derived(chart.theme.palettes.categorical[0]);
</script>

<g class="mz-rects {className}" {stroke}>
	{#each rects as rect, i}
		<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
		<rect
			x={rect.x}
			y={rect.y}
			width={rect.width}
			height={rect.height}
			{rx}
			fill={fill ? access(fill, rect.d, i) : defaultFill}
			fill-opacity={access(opacity, rect.d, i)}
			onpointerenter={onpointerenter ? (e) => onpointerenter(rect.d, e) : undefined}
			onpointerleave={onpointerleave ? (e) => onpointerleave(rect.d, e) : undefined}
			onclick={onclick ? (e) => onclick(rect.d, e) : undefined}
			>{#if title}<title>{title(rect.d)}</title>{/if}</rect
		>
	{/each}
</g>
