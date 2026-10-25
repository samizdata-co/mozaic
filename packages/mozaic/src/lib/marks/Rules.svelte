<!--
@component
Reference lines across the whole plot: vertical at each `x` value, horizontal
at each `y` value. Typically the zero line.
-->
<script lang="ts">
	import { usePlot } from '../core/context.js';
	import { scaled } from '../core/scales.js';

	interface Props {
		x?: unknown[];
		y?: unknown[];
		stroke?: string;
		strokeWidth?: number;
		dash?: string;
		class?: string;
	}

	let {
		x = [],
		y = [],
		stroke = 'var(--mz-color-text)',
		strokeWidth = 1,
		dash,
		class: className = ''
	}: Props = $props();

	const plot = usePlot();
</script>

<g class="mz-rules {className}" style:stroke stroke-width={strokeWidth} stroke-dasharray={dash}>
	{#each x as value}
		{@const px = scaled(plot.x, value)}
		<line x1={px} x2={px} y2={plot.height} />
	{/each}
	{#each y as value}
		{@const py = scaled(plot.y, value)}
		<line y1={py} y2={py} x2={plot.width} />
	{/each}
</g>

<style>
	.mz-rules line {
		shape-rendering: crispEdges;
	}
</style>
