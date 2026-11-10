<!--
@component
Vertical axis for the plot's y scale. With `inside`, labels sit just above
the gridlines inside the plot area, which saves left padding on small screens.
`unit` names the unit once, after the top tick label ("50 lei/m³"); on a
left axis it runs into the plot, so it needs no extra padding. A `\n` in a
label (from `format` or a band domain) breaks it into lines, centred on the tick.
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
		/** Unit written after the top tick label, e.g. "lei/m³" or "%". */
		unit?: string;
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
		unit,
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
	// The tick nearest the top of the plot carries the unit.
	const top = $derived(
		unit
			? values.reduce((a, b) => ((scaled(plot.y, b) ?? Infinity) < (scaled(plot.y, a) ?? Infinity) ? b : a), values[0])
			: undefined
	);
	// Outside a left axis, the unit starts where the numbers end and runs into the plot.
	const unitApart = $derived(position === 'left' && !inside);
	/** Line height of a label broken with `\n`, in em. */
	const LINE = 1.15;
</script>

<!-- One `<text>` per label; extra lines are tspans, the first raised so the block centres on `dy`. -->
{#snippet lines(text: string, x: number, dy: number)}
	{@const parts = text.split('\n')}
	{@const first = dy - (inside ? parts.length - 1 : (parts.length - 1) / 2) * LINE}
	<text {x} dy="{first}em" text-anchor={anchor}
		>{#each parts as part, j (j)}{#if j === 0}{part}{:else}<tspan {x} dy="{LINE}em">{part}</tspan>{/if}{/each}</text
	>
{/snippet}

<g class="mz-axis mz-axis-y {className}" transform="translate({position === 'left' ? 0 : plot.width},0)">
	{#if baseline}<line class="mz-axis-line" y2={plot.height} />{/if}
	{#each values as value, i (value)}
		{@const withUnit = unit && value === top && !unitApart ? `${fmt(value, i)} ${unit}` : fmt(value, i)}
		<g class="mz-tick" transform="translate(0,{scaled(plot.y, value)})">
			{#if tickSize > 0 && !inside}<line x2={dir * tickSize} />{/if}
			{#if inside}
				{@render lines(withUnit, 0, -0.35)}
			{:else}
				{@render lines(withUnit, dir * (tickSize + tickPadding), 0.32)}
			{/if}
			{#if unit && value === top && unitApart}
				<text class="mz-axis-unit" x={-(tickSize + tickPadding) + 4} dy="0.32em" text-anchor="start">{unit}</text>
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
	.mz-axis-unit {
		paint-order: stroke;
		stroke: var(--mz-color-bg);
		stroke-width: 3px;
		stroke-linejoin: round;
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
