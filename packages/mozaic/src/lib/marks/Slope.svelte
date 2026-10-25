<!--
@component
A slope chart: each item is a line from its start value (left edge of the
plot) to its end value (right edge), with labels on both sides nudged apart.
Needs a continuous y scale; leave padding left and right for the labels.
-->
<script lang="ts" generics="T">
	import { useChart, usePlot } from '../core/context.js';
	import { avoidOverlap } from '../transforms/labels.js';

	interface Props {
		data: T[];
		start: (d: T) => number;
		end: (d: T) => number;
		label: (d: T) => string;
		color?: (d: T, index: number) => string;
		format?: (n: number) => string;
		/** Column headings, e.g. ['2015', '2025']. */
		headings?: [string, string];
		/** Minimum vertical distance between labels, px. */
		minGap?: number;
		class?: string;
	}

	let {
		data,
		start,
		end,
		label,
		color,
		format = String,
		headings,
		minGap = 14,
		class: className = ''
	}: Props = $props();

	const chart = useChart();
	const plot = usePlot();

	const left = $derived(
		avoidOverlap(
			data.map((d) => plot.y(start(d)) ?? 0),
			minGap,
			[0, plot.height]
		)
	);
	const right = $derived(
		avoidOverlap(
			data.map((d) => plot.y(end(d)) ?? 0),
			minGap,
			[0, plot.height]
		)
	);
	const colour = (d: T, i: number) =>
		color?.(d, i) ?? chart.theme.palettes.categorical[i % chart.theme.palettes.categorical.length];
</script>

<g class="mz-slope {className}">
	{#if headings}
		<text class="mz-slope-heading" x={0} y={-10} text-anchor="middle">{headings[0]}</text>
		<text class="mz-slope-heading" x={plot.width} y={-10} text-anchor="middle">{headings[1]}</text>
	{/if}
	<line class="mz-slope-axis" x1={0} x2={0} y2={plot.height} />
	<line class="mz-slope-axis" x1={plot.width} x2={plot.width} y2={plot.height} />
	{#each data as d, i}
		<line
			x1={0}
			x2={plot.width}
			y1={plot.y(start(d))}
			y2={plot.y(end(d))}
			stroke={colour(d, i)}
			stroke-width={chart.theme.plot.lineWidth}
			stroke-linecap="round"
		/>
		<circle cx={0} cy={plot.y(start(d))} r={4} fill={colour(d, i)} />
		<circle cx={plot.width} cy={plot.y(end(d))} r={4} fill={colour(d, i)} />
		<text x={-10} y={left[i]} dy="0.32em" text-anchor="end"
			>{label(d)} <tspan class="mz-slope-value">{format(start(d))}</tspan></text
		>
		<text x={plot.width + 10} y={right[i]} dy="0.32em"
			><tspan class="mz-slope-value">{format(end(d))}</tspan> {label(d)}</text
		>
	{/each}
</g>

<style>
	text {
		fill: var(--mz-color-text);
		font-size: var(--mz-size-axis);
		paint-order: stroke;
		stroke: var(--mz-color-bg);
		stroke-width: 3px;
		stroke-linejoin: round;
	}
	.mz-slope-value {
		font-weight: var(--mz-weight-strong);
	}
	.mz-slope-heading {
		font-family: var(--mz-font-label);
		font-weight: var(--mz-weight-label);
		text-transform: var(--mz-label-transform);
		letter-spacing: var(--mz-label-tracking);
		fill: var(--mz-color-muted);
	}
	.mz-slope-axis {
		stroke: var(--mz-color-grid);
	}
	circle {
		stroke: var(--mz-color-bg);
		stroke-width: 1.5;
	}
</style>
