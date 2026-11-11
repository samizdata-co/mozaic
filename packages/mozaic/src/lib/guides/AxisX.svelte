<!--
@component
Horizontal axis for the plot's x scale. Tick labels use the chart's locale
unless you pass `format`. On a continuous scale, labels that would overlap are
thinned to every other tick (or every third, and so on); the tick marks stay.
`unit` names the unit once, after the last labelled tick ("20 c/kWh"), kept
inside the chart.
-->
<script lang="ts">
	import { useChart, usePlot } from '../core/context.js';
	import { estimateTextWidth, scaled } from '../core/scales.js';
	import { useTextWidth } from '../core/text.svelte.js';
	import { defaultTickFormat, tickStride, tickValues } from './ticks.js';

	interface Props {
		/** Approximate number of ticks for continuous scales. */
		ticks?: number;
		/** Exact tick values; overrides `ticks`. */
		tickValues?: unknown[];
		format?: (value: any, index: number) => string;
		position?: 'bottom' | 'top';
		tickSize?: number;
		tickPadding?: number;
		/** Draw the axis line. */
		baseline?: boolean;
		/** Axis title, drawn at the end of the axis. */
		label?: string;
		/** Unit written after the last labelled tick, e.g. "lei/m³" or "euro a year". */
		unit?: string;
		class?: string;
	}

	const chart = useChart();
	const plot = usePlot();

	let {
		ticks,
		tickValues: explicitValues,
		format,
		position = 'bottom',
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
	const values = $derived(tickValues(plot.x, ticks ?? chart.theme.plot.ticks, explicitValues));
	const fmt = $derived(format ?? defaultTickFormat(values, chart.locale));
	const dir = $derived(position === 'bottom' ? 1 : -1);
	const measure = useTextWidth();
	const raw = $derived(values.map((value, i) => ({ value, px: scaled(plot.x, value), label: fmt(value, i) })));
	// The unit makes the last label longer, so the thinning takes it into account.
	const withUnit = (list: typeof raw) =>
		unit && list.length
			? list.map((t, i) => (i === list.length - 1 ? { ...t, label: `${t.label} ${unit}` } : t))
			: list;
	// Band and point scales name every category, so only continuous scales are thinned.
	const stride = $derived(
		plot.x.bandwidth
			? 1
			: tickStride(
					raw.map((t) => t.px),
					withUnit(raw).map((t) => measure(t.label, chart.theme.plot.fontSize, chart.theme.tokens['--mz-font-body']))
				)
	);
	/** Index of the last tick that gets a label: the one that carries the unit. */
	const lastShown = $derived(raw.length ? raw.length - 1 - ((raw.length - 1) % stride) : -1);
	const items = $derived(
		raw.map((t, i) => (unit && i === lastShown && !plot.x.bandwidth ? { ...t, label: `${t.label} ${unit}` } : t))
	);

	// Labels that would spill past the chart edge are anchored inwards instead of centred.
	function anchor(px: number, label: string): 'start' | 'middle' | 'end' {
		const half = estimateTextWidth(label, chart.theme.plot.fontSize) / 2;
		if (px + half > plot.width + plot.padding.right) return 'end';
		if (px - half < -plot.padding.left) return 'start';
		return 'middle';
	}
</script>

<g class="mz-axis mz-axis-x {className}" transform="translate(0,{position === 'bottom' ? plot.height : 0})">
	{#if baseline}<line class="mz-axis-line" x2={plot.width} />{/if}
	{#each items as { value, px, label }, i (value)}
		<g class="mz-tick" transform="translate({px},0)">
			{#if tickSize > 0}<line y2={dir * tickSize} />{/if}
			{#if i % stride === 0}
				<text
					y={dir * (tickSize + tickPadding)}
					dy={position === 'bottom' ? '0.71em' : '0'}
					text-anchor={anchor(px, label)}
				>
					{label}
				</text>
			{/if}
		</g>
	{/each}
	{#if label}
		<text
			class="mz-axis-label"
			x={plot.width}
			y={dir * (tickSize + tickPadding) * 3.2}
			dy={position === 'bottom' ? '0.71em' : '0'}
			text-anchor="end">{label}</text
		>
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
