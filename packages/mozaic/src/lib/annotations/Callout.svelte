<!--
@component
A text annotation with an optional curved arrow pointing at a data point.
`x`/`y` are in data space (band scales point at the band centre); `dx`/`dy`
place the label in pixels relative to that point. Newlines split the label.
-->
<script lang="ts">
	import { useChart, usePlot } from '../core/context.js';
	import { scaled } from '../core/scales.js';
	import { calloutGeometry } from './callout-geometry.js';

	interface Props {
		x: unknown;
		y: unknown;
		label: string;
		dx?: number;
		dy?: number;
		/** Which way the arrow bends, or a number (positive = clockwise). */
		curve?: 'left' | 'right' | 'none' | number;
		arrow?: boolean;
		/** Defaults to `start` when the label is right of the target, `end` when left. */
		anchor?: 'start' | 'middle' | 'end';
		fontSize?: number;
		class?: string;
	}

	let {
		x,
		y,
		label,
		dx = 0,
		dy = -32,
		curve = 'right',
		arrow = true,
		anchor,
		fontSize,
		class: className = ''
	}: Props = $props();

	const chart = useChart();
	const plot = usePlot();

	const size = $derived(fontSize ?? chart.theme.plot.fontSize);
	const lines = $derived(label.split('\n'));
	const lineHeight = $derived(size * 1.25);
	const textAnchor = $derived(anchor ?? (dx > 0 ? 'start' : dx < 0 ? 'end' : 'middle'));
	const bend = $derived(curve === 'right' ? 0.3 : curve === 'left' ? -0.3 : curve === 'none' ? 0 : curve);

	const tx = $derived(scaled(plot.x, x));
	const ty = $derived(scaled(plot.y, y));
	const lx = $derived(tx + dx);
	const ly = $derived(ty + dy);
	// The first baseline sits at ly; the block extends down by the extra lines.
	const top = $derived(ly - size * 0.8);
	const bottom = $derived(ly + (lines.length - 1) * lineHeight + size * 0.25);

	const geometry = $derived(calloutGeometry({ tx, ty, lx, ly, top, bottom, anchor: textAnchor, bend }));
</script>

<g class="mz-callout {className}">
	{#if arrow}
		<path class="mz-callout-arrow" d={geometry.arrow} />
		<path class="mz-callout-arrow" d={geometry.head} />
	{/if}
	<text x={lx} y={ly} text-anchor={textAnchor} font-size={size}>
		{#each lines as line, i}
			<tspan x={lx} dy={i === 0 ? 0 : lineHeight}>{line}</tspan>
		{/each}
	</text>
</g>

<style>
	.mz-callout-arrow {
		fill: none;
		stroke: var(--mz-color-text);
		stroke-width: 1;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	text {
		fill: var(--mz-color-text);
		paint-order: stroke;
		stroke: var(--mz-color-bg);
		stroke-width: 3px;
		stroke-linejoin: round;
	}
</style>
