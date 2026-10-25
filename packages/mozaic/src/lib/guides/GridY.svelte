<!--
@component
Horizontal gridlines at the y scale's ticks. Hairline and recessive by default.
-->
<script lang="ts">
	import { useChart, usePlot } from '../core/context.js';
	import { scaled } from '../core/scales.js';
	import { tickValues } from './ticks.js';

	let {
		ticks,
		tickValues: explicitValues,
		class: className = ''
	}: { ticks?: number; tickValues?: unknown[]; class?: string } = $props();

	const chart = useChart();
	const plot = usePlot();
	const values = $derived(tickValues(plot.y, ticks ?? chart.theme.plot.ticks, explicitValues));
</script>

<g class="mz-grid mz-grid-y {className}">
	{#each values as value (value)}
		{@const py = scaled(plot.y, value)}
		<line y1={py} y2={py} x2={plot.width} />
	{/each}
</g>

<style>
	.mz-grid line {
		stroke: var(--mz-color-grid);
		stroke-width: 1;
		stroke-dasharray: var(--mz-grid-dash);
		shape-rendering: crispEdges;
	}
</style>
