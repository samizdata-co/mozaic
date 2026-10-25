<!--
@component
Direct labels at the end of lines: a dot in the series colour on the last
point, and the label in text colour beside it. Labels are nudged apart so
they never overlap; a short leader joins a nudged label to its dot.
-->
<script lang="ts" generics="T">
	import { usePlot } from '../core/context.js';
	import { scaled } from '../core/scales.js';
	import { avoidOverlap } from '../transforms/labels.js';

	interface Props {
		/** One item per series, describing its last point. */
		data: T[];
		x: (d: T) => any;
		y: (d: T) => any;
		text: (d: T) => string;
		color: (d: T) => string;
		/** Gap between the dot and the label, px. */
		dx?: number;
		/** Minimum vertical distance between labels, px. */
		minGap?: number;
		class?: string;
	}

	let { data, x, y, text, color, dx = 10, minGap = 14, class: className = '' }: Props = $props();

	const plot = usePlot();

	const labels = $derived.by(() => {
		const points = data.map((d) => ({ d, px: scaled(plot.x, x(d)), py: scaled(plot.y, y(d)) }));
		const placed = avoidOverlap(
			points.map((p) => p.py),
			minGap,
			[0, plot.height]
		);
		return points.map((p, i) => ({ ...p, ly: placed[i] }));
	});
</script>

<g class="mz-line-end-labels {className}">
	{#each labels as label}
		{#if Math.abs(label.ly - label.py) > 2}
			<path class="mz-leader" d="M{label.px + 5},{label.py}L{label.px + dx - 3},{label.ly}" />
		{/if}
		<circle cx={label.px} cy={label.py} r={4} fill={color(label.d)} />
		<text x={label.px + dx} y={label.ly} dy="0.32em">{text(label.d)}</text>
	{/each}
</g>

<style>
	circle {
		stroke: var(--mz-color-bg);
		stroke-width: 2;
	}
	text {
		fill: var(--mz-color-text);
		font-size: var(--mz-size-axis);
		font-weight: var(--mz-weight-strong);
		paint-order: stroke;
		stroke: var(--mz-color-bg);
		stroke-width: 3px;
		stroke-linejoin: round;
	}
	.mz-leader {
		fill: none;
		stroke: var(--mz-color-faint);
		stroke-width: 1;
	}
</style>
