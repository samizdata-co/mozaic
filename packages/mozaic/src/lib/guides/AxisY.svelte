<!--
@component
Vertical axis for the plot's y scale. With `inside`, labels sit just above
the gridlines inside the plot area, which saves left padding on small screens.
-->
<script lang="ts">
	import { useChart, usePlot } from '../core/context.js';
	import { scaled } from '../core/scales.js';
	import { defaultTickFormat, tickValues } from './ticks.js';

	interface Props {
		ticks?: number;
		tickValues?: unknown[];
		format?: (value: any, index: number) => string;
		position?: 'left' | 'right';
		/** Put labels above the gridlines, inside the plot area. */
		inside?: boolean;
		tickSize?: number;
		tickPadding?: number;
		baseline?: boolean;
		/** Axis title, drawn above the axis. */
		label?: string;
		class?: string;
	}

	const chart = useChart();
	const plot = usePlot();

	let {
		ticks,
		tickValues: explicitValues,
		format,
		position = 'left',
		inside = false,
		tickSize: tickSizeInput,
		tickPadding: tickPaddingInput,
		baseline: baselineInput,
		label,
		class: className = ''
	}: Props = $props();

	// Theme defaults are derived (not destructuring defaults) so they follow style changes.
	const tickSize = $derived(tickSizeInput ?? chart.theme.plot.tickSize);
	const tickPadding = $derived(tickPaddingInput ?? chart.theme.plot.tickPadding);
	const baseline = $derived(baselineInput ?? chart.theme.plot.axisLine);
	const values = $derived(tickValues(plot.y, ticks ?? chart.theme.plot.ticks, explicitValues));
	const fmt = $derived(format ?? defaultTickFormat(values, chart.locale));
	const dir = $derived(position === 'left' ? -1 : 1);
	const anchor = $derived(inside ? (position === 'left' ? 'start' : 'end') : position === 'left' ? 'end' : 'start');
</script>

<g class="mz-axis mz-axis-y {className}" transform="translate({position === 'left' ? 0 : plot.width},0)">
	{#if baseline}<line class="mz-axis-line" y2={plot.height} />{/if}
	{#each values as value, i (value)}
		<g class="mz-tick" transform="translate(0,{scaled(plot.y, value)})">
			{#if tickSize > 0 && !inside}<line x2={dir * tickSize} />{/if}
			{#if inside}
				<text x={0} dy="-0.35em" text-anchor={anchor}>{fmt(value, i)}</text>
			{:else}
				<text x={dir * (tickSize + tickPadding)} dy="0.32em" text-anchor={anchor}>{fmt(value, i)}</text>
			{/if}
		</g>
	{/each}
	{#if label}
		<text class="mz-axis-label" y={-12} text-anchor={position === 'left' ? 'start' : 'end'}>{label}</text>
	{/if}
</g>

<style>
	.mz-axis text {
		fill: var(--mz-color-muted);
		font-size: var(--mz-size-axis);
	}
	.mz-axis line {
		stroke: var(--mz-color-axis);
		shape-rendering: crispEdges;
	}
	.mz-axis-label {
		font-family: var(--mz-font-label);
		font-weight: var(--mz-weight-label);
		text-transform: var(--mz-label-transform);
		letter-spacing: var(--mz-label-tracking);
	}
</style>
