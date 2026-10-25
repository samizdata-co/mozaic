<!--
@component
Nested circles explaining a radius scale (usually `scaleSqrt`), for
proportional symbol maps and bubble charts. Drawn as SVG.
-->
<script lang="ts">
	import { useChart } from '../core/context.js';

	interface Props {
		/** Value → radius in px. */
		scale: (value: number) => number;
		values: number[];
		format?: (value: number) => string;
		title?: string;
		class?: string;
	}

	let { scale, values, format, title, class: className = '' }: Props = $props();

	const chart = useChart();
	const sorted = $derived([...values].sort((a, b) => b - a));
	const maxR = $derived(Math.max(...sorted.map((v) => scale(v)), 1));
	const top = $derived(title ? 16 : 0);
	const fmt = $derived(format ?? chart.locale.number);
</script>

<svg class="mz-size-legend {className}" width={maxR * 2 + 60} height={top + maxR * 2 + 2} role="img" aria-label={title}>
	{#if title}<text class="mz-size-title" x={0} y={11}>{title}</text>{/if}
	{#each sorted as v}
		{@const r = scale(v)}
		<circle cx={maxR + 1} cy={top + maxR * 2 + 1 - r} {r} />
		<line x1={maxR + 1} x2={maxR * 2 + 8} y1={top + maxR * 2 + 1 - r * 2} y2={top + maxR * 2 + 1 - r * 2} />
		<text x={maxR * 2 + 11} y={top + maxR * 2 + 1 - r * 2} dy="0.32em">{fmt(v)}</text>
	{/each}
</svg>

<style>
	.mz-size-legend {
		display: block;
		overflow: visible;
		font-family: var(--mz-font-body);
	}
	circle {
		fill: none;
		stroke: var(--mz-color-muted);
	}
	line {
		stroke: var(--mz-color-axis);
		stroke-dasharray: 2 2;
	}
	text {
		fill: var(--mz-color-muted);
		font-size: var(--mz-size-axis);
	}
	.mz-size-title {
		fill: var(--mz-color-text);
		font-family: var(--mz-font-label);
		font-weight: var(--mz-weight-label);
		text-transform: var(--mz-label-transform);
		letter-spacing: var(--mz-label-tracking);
	}
</style>
