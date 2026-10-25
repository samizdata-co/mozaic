<!--
@component
A tiny inline line chart, e.g. in a table cell. Not a full chart: no axes.
The last point gets a dot.
-->
<script lang="ts">
	import { extent } from 'd3-array';
	import { scaleLinear } from 'd3-scale';
	import { line } from 'd3-shape';

	interface Props {
		values: number[];
		width?: number;
		height?: number;
		stroke?: string;
		/** Shared y domain, so several sparklines are comparable. */
		domain?: [number, number];
		label?: string;
	}

	let { values, width = 80, height = 20, stroke = 'var(--mz-color-text)', domain, label }: Props = $props();

	const x = $derived(
		scaleLinear()
			.domain([0, Math.max(1, values.length - 1)])
			.range([2, width - 3])
	);
	const y = $derived(
		scaleLinear()
			.domain(domain ?? (extent(values) as [number, number]))
			.range([height - 3, 3])
	);
	const d = $derived(
		line<number>()
			.x((_, i) => x(i))
			.y((v) => y(v))(values) ?? ''
	);
	const last = $derived(values.length - 1);
</script>

<svg
	class="mz-sparkline"
	{width}
	{height}
	viewBox="0 0 {width} {height}"
	role={label ? 'img' : 'presentation'}
	aria-label={label}
>
	<path {d} fill="none" style:stroke stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />
	{#if last >= 0}<circle cx={x(last)} cy={y(values[last])} r="2.25" style:fill={stroke} />{/if}
</svg>

<style>
	.mz-sparkline {
		display: inline-block;
		vertical-align: middle;
		overflow: visible;
	}
</style>
