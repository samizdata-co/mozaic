<!--
@component
One horizontal arrow per row, from a start value to an end value: how each
category changed between two dates (an arrow plot). Needs a band y scale (one
row per category) and a continuous x scale. Arrows shorter than their head
are drawn as the head alone, so a tiny change still shows its direction.
-->
<script lang="ts" generics="T">
	import { useChart, usePlot } from '../core/context.js';
	import { access, type Accessor } from '../core/accessor.js';
	import { scaled } from '../core/scales.js';

	interface Props {
		data: T[];
		y: (d: T) => string;
		/** Start value (e.g. the earlier date): the arrow's tail. */
		x1: (d: T) => number;
		/** End value (e.g. the later date): the arrowhead. */
		x2: (d: T) => number;
		/** Arrow colour; defaults to the first categorical colour. */
		stroke?: Accessor<T, string>;
		/** Line width in px. */
		strokeWidth?: number;
		/** Arrowhead length in px (its width is the same). */
		headSize?: number;
		opacity?: Accessor<T, number>;
		/** Accessible label per arrow (adds a <title>). */
		title?: (d: T) => string;
		onpointerenter?: (d: T, event: PointerEvent) => void;
		onpointerleave?: (d: T, event: PointerEvent) => void;
		class?: string;
	}

	let {
		data,
		y,
		x1,
		x2,
		stroke,
		strokeWidth = 2,
		headSize = 8,
		opacity = 1,
		title,
		onpointerenter,
		onpointerleave,
		class: className = ''
	}: Props = $props();

	const chart = useChart();
	const plot = usePlot();
	const fallback = $derived(chart.theme.palettes.categorical[0]);

	const geometry = (d: T) => {
		const cy = scaled(plot.y, y(d));
		const sx = plot.x(x1(d)) ?? 0;
		const ex = plot.x(x2(d)) ?? 0;
		const dir = ex >= sx ? 1 : -1;
		// The head ends exactly at the end value; the line stops where the head begins.
		const base = Math.abs(ex - sx) > headSize ? ex - dir * headSize : sx;
		const half = headSize / 2;
		return {
			line: Math.abs(ex - sx) > headSize ? `M${sx},${cy}H${base}` : '',
			head: `M${ex},${cy}L${ex - dir * headSize},${cy - half}L${ex - dir * headSize},${cy + half}Z`
		};
	};
</script>

<g class="mz-arrows {className}">
	{#each data as d, i}
		{@const g = geometry(d)}
		{@const c = stroke === undefined ? fallback : access(stroke, d, i)}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<g
			opacity={access(opacity, d, i)}
			onpointerenter={onpointerenter ? (e) => onpointerenter(d, e) : undefined}
			onpointerleave={onpointerleave ? (e) => onpointerleave(d, e) : undefined}
		>
			{#if title}<title>{title(d)}</title>{/if}
			{#if g.line}<path class="mz-arrows-line" d={g.line} stroke={c} stroke-width={strokeWidth} />{/if}
			<path class="mz-arrows-head" d={g.head} fill={c} />
		</g>
	{/each}
</g>

<style>
	.mz-arrows-line {
		fill: none;
		stroke-linecap: butt;
	}
	.mz-arrows-head {
		stroke: none;
	}
</style>
