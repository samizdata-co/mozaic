<!--
@component
A label next to a data point, with an optional marker dot. For labelling a
few highlighted points in a scatter plot. Text has a halo for legibility.
Pass `color` (the point's series colour) to colour the label and marker.
-->
<script lang="ts">
	import { useChart, usePlot } from '../core/context.js';
	import { position } from '../core/scales.js';
	import { readableColor } from '../styles/color.js';

	interface Props {
		x: unknown;
		y: unknown;
		label: string;
		dx?: number;
		dy?: number;
		anchor?: 'start' | 'middle' | 'end';
		/** Draw a ring around the point. */
		marker?: boolean;
		bold?: boolean;
		/**
		 * Colour for the label and marker, usually the series colour of the
		 * point. Darkened (or lightened on dark backgrounds) where needed to
		 * reach 4.5:1 against the background. Defaults to the text colour.
		 */
		color?: string;
		class?: string;
	}

	let {
		x,
		y,
		label,
		dx = 6,
		dy = 0,
		anchor,
		marker = false,
		bold = false,
		color,
		class: className = ''
	}: Props = $props();

	const chart = useChart();
	const plot = usePlot();
	const p = $derived(position(plot, x, y));
	const textAnchor = $derived(anchor ?? (dx > 0 ? 'start' : dx < 0 ? 'end' : 'middle'));
	const ink = $derived(color ? readableColor(color, chart.theme.tokens['--mz-color-bg']) : undefined);
</script>

<g class="mz-label {className}">
	{#if marker}<circle cx={p[0]} cy={p[1]} r={6} style:stroke={ink} />{/if}
	<text
		x={p[0] + dx}
		y={p[1] + dy}
		dy="0.32em"
		text-anchor={textAnchor}
		style:fill={ink}
		style:font-weight={bold ? 'var(--mz-weight-strong)' : undefined}>{label}</text
	>
</g>

<style>
	circle {
		fill: none;
		stroke: var(--mz-color-text);
		stroke-width: 1.5;
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
