<!--
@component
Two values per category joined by a line: before/after, men/women. Needs a
band y scale (one row per category) and a continuous x scale.
-->
<script lang="ts" generics="T">
	import { useChart, usePlot } from '../core/context.js';
	import { scaled } from '../core/scales.js';

	interface Props {
		data: T[];
		y: (d: T) => string;
		/** First value (e.g. before). */
		x1: (d: T) => number;
		/** Second value (e.g. after). */
		x2: (d: T) => number;
		color1?: string;
		color2?: string;
		r?: number;
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
		color1,
		color2,
		r = 5,
		title,
		onpointerenter,
		onpointerleave,
		class: className = ''
	}: Props = $props();

	const chart = useChart();
	const plot = usePlot();
	const c1 = $derived(color1 ?? chart.theme.palettes.categorical[1]);
	const c2 = $derived(color2 ?? chart.theme.palettes.categorical[0]);
</script>

<g class="mz-dumbbell {className}">
	{#each data as d}
		{@const cy = scaled(plot.y, y(d))}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<g
			onpointerenter={onpointerenter ? (e) => onpointerenter(d, e) : undefined}
			onpointerleave={onpointerleave ? (e) => onpointerleave(d, e) : undefined}
		>
			{#if title}<title>{title(d)}</title>{/if}
			<line class="mz-dumbbell-bar" x1={plot.x(x1(d))} x2={plot.x(x2(d))} y1={cy} y2={cy} />
			<circle cx={plot.x(x1(d))} {cy} {r} fill={c1} />
			<circle cx={plot.x(x2(d))} {cy} {r} fill={c2} />
		</g>
	{/each}
</g>

<style>
	.mz-dumbbell-bar {
		stroke: var(--mz-color-axis);
		stroke-width: 2;
	}
	circle {
		stroke: var(--mz-color-bg);
		stroke-width: 1.5;
	}
</style>
