<!--
@component
A labelled reference line at an x value (vertical) or y value (horizontal):
a target, an average, an event date.
-->
<script lang="ts">
	import { usePlot } from '../core/context.js';
	import { scaled } from '../core/scales.js';

	interface Props {
		/** Vertical line at this x value. */
		x?: unknown;
		/** Horizontal line at this y value. */
		y?: unknown;
		label?: string;
		/** Where the label sits along the line. */
		labelPosition?: 'start' | 'end';
		dash?: string;
		stroke?: string;
		class?: string;
	}

	let {
		x,
		y,
		label,
		labelPosition = 'end',
		dash = '4 3',
		stroke = 'var(--mz-color-text)',
		class: className = ''
	}: Props = $props();

	const plot = usePlot();
	const px = $derived(x === undefined ? undefined : scaled(plot.x, x));
	const py = $derived(y === undefined ? undefined : scaled(plot.y, y));
</script>

<g class="mz-ref-line {className}">
	{#if px !== undefined}
		<line x1={px} x2={px} y2={plot.height} style:stroke stroke-dasharray={dash} />
		{#if label}
			<text x={px + 4} y={labelPosition === 'end' ? 0 : plot.height - 4} dy={labelPosition === 'end' ? '0.9em' : '0'}
				>{label}</text
			>
		{/if}
	{/if}
	{#if py !== undefined}
		<line y1={py} y2={py} x2={plot.width} style:stroke stroke-dasharray={dash} />
		{#if label}
			<text
				x={labelPosition === 'end' ? plot.width : 0}
				y={py - 4}
				text-anchor={labelPosition === 'end' ? 'end' : 'start'}>{label}</text
			>
		{/if}
	{/if}
</g>

<style>
	line {
		stroke-width: 1;
		shape-rendering: crispEdges;
	}
	text {
		fill: var(--mz-color-text);
		font-size: var(--mz-size-axis);
		paint-order: stroke;
		stroke: var(--mz-color-bg);
		stroke-width: 3px;
		stroke-linejoin: round;
	}
</style>
