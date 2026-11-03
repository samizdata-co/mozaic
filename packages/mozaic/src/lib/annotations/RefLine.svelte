<!--
@component
A labelled reference line at an x value (vertical) or y value (horizontal):
a target, an average, an event date. Newlines split the label. For event
markers, `dotted` draws a line of dots and a negative `labelY` puts the label
in the top padding, above the data, with the line running up to it.
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
		/** Vertical lines: which side of the line the label is on (`start`: right, `end`: left). */
		anchor?: 'start' | 'end';
		/** Vertical lines with the label at the end: label top in px from the top of the plot. Negative values sit in the padding above it. */
		labelY?: number;
		dash?: string;
		/** A line of round dots instead of dashes. */
		dotted?: boolean;
		stroke?: string;
		class?: string;
	}

	let {
		x,
		y,
		label,
		labelPosition = 'end',
		anchor = 'start',
		labelY = 0,
		dash = '4 3',
		dotted = false,
		stroke = 'var(--mz-color-text)',
		class: className = ''
	}: Props = $props();

	const plot = usePlot();
	const px = $derived(x === undefined ? undefined : scaled(plot.x, x));
	const py = $derived(y === undefined ? undefined : scaled(plot.y, y));
	const lines = $derived(label ? label.split('\n') : []);
	const top = $derived(labelPosition === 'end' ? Math.min(0, labelY) : 0);
	const dx = $derived(anchor === 'start' ? 4 : -4);
	// Labels that end at a point (above a horizontal line, at the foot of a vertical one) start this far up.
	const lift = $derived(`-${(lines.length - 1) * 1.15}em`);
</script>

<g class="mz-ref-line {className}">
	{#if px !== undefined}
		<line
			x1={px}
			x2={px}
			y1={top}
			y2={plot.height}
			style:stroke
			stroke-dasharray={dotted ? '0 3' : dash}
			stroke-linecap={dotted ? 'round' : undefined}
			class:dotted
		/>
		{#if label}
			<text x={px + dx} y={labelPosition === 'end' ? labelY : plot.height - 4} text-anchor={anchor}>
				{#each lines as line, i (i)}
					<tspan x={px + dx} dy={i === 0 ? (labelPosition === 'end' ? '0.9em' : lift) : '1.15em'}>{line}</tspan>
				{/each}
			</text>
		{/if}
	{/if}
	{#if py !== undefined}
		<line y1={py} y2={py} x2={plot.width} style:stroke stroke-dasharray={dash} />
		{#if label}
			<text
				x={labelPosition === 'end' ? plot.width : 0}
				y={py - 4}
				text-anchor={labelPosition === 'end' ? 'end' : 'start'}
			>
				{#each lines as line, i (i)}
					<tspan x={labelPosition === 'end' ? plot.width : 0} dy={i === 0 ? lift : '1.15em'}>{line}</tspan>
				{/each}
			</text>
		{/if}
	{/if}
</g>

<style>
	line {
		stroke-width: 1;
		shape-rendering: crispEdges;
	}
	line.dotted {
		stroke-width: 1.5;
		shape-rendering: auto;
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
