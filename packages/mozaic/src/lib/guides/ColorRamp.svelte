<!--
@component
A continuous colour legend: a gradient bar with ticks, for sequential or
diverging colour scales (`scaleSequential`, `scaleDiverging`, or a linear
scale with a colour range). Drawn as SVG so it prints and exports.
-->
<script lang="ts">
	import { useChart } from '../core/context.js';

	type ColorScale = { (value: number): string; domain(): number[]; ticks?: (count?: number) => number[] };

	interface Props {
		scale: ColorScale;
		/** Width in px. */
		width?: number;
		/** Bar height in px. */
		height?: number;
		ticks?: number;
		tickValues?: number[];
		format?: (value: number) => string;
		title?: string;
		class?: string;
	}

	let {
		scale,
		width = 240,
		height = 10,
		ticks = 5,
		tickValues,
		format,
		title,
		class: className = ''
	}: Props = $props();

	const chart = useChart();
	const uid = $props.id();
	const STEPS = 32;

	const domain = $derived(scale.domain());
	const lo = $derived(domain[0]);
	const hi = $derived(domain[domain.length - 1]);
	const stops = $derived(
		Array.from({ length: STEPS + 1 }, (_, i) => ({ offset: i / STEPS, color: scale(lo + ((hi - lo) * i) / STEPS) }))
	);
	const values = $derived(tickValues ?? scale.ticks?.(ticks) ?? domain);
	const fmt = $derived(format ?? chart.locale.number);
	const xOf = (v: number) => (hi === lo ? 0 : ((v - lo) / (hi - lo)) * width);
	const top = $derived(title ? 16 : 0);
</script>

<svg
	class="mz-color-ramp {className}"
	width={width + 16}
	height={top + height + 20}
	viewBox="-8 0 {width + 16} {top + height + 20}"
	role="img"
	aria-label={title}
>
	<defs>
		<linearGradient id="{uid}-ramp">
			{#each stops as stop}<stop offset={stop.offset} stop-color={stop.color} />{/each}
		</linearGradient>
	</defs>
	{#if title}<text class="mz-ramp-title" x={0} y={11}>{title}</text>{/if}
	<rect y={top} {width} {height} fill="url(#{uid}-ramp)" />
	{#each values as v}
		<line x1={xOf(v)} x2={xOf(v)} y1={top} y2={top + height + 3} />
		<text x={xOf(v)} y={top + height + 14} text-anchor="middle">{fmt(v)}</text>
	{/each}
</svg>

<style>
	.mz-color-ramp {
		display: block;
		overflow: visible;
		font-family: var(--mz-font-body);
	}
	text {
		fill: var(--mz-color-muted);
		font-size: var(--mz-size-axis);
	}
	.mz-ramp-title {
		fill: var(--mz-color-text);
		font-family: var(--mz-font-label);
		font-weight: var(--mz-weight-label);
		text-transform: var(--mz-label-transform);
		letter-spacing: var(--mz-label-tracking);
	}
	line {
		stroke: var(--mz-color-bg);
	}
</style>
