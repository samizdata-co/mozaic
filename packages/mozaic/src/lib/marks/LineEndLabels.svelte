<!--
@component
Direct labels at the end of lines: a dot in the series colour on the last
point, and the label beside it, in the text colour or (with `colorText`) in
the series colour so the labels double as the legend. Labels are nudged apart
so they never overlap; a short leader joins a nudged label to its dot. A label
too long for the room right of the plot breaks onto two or more lines.
-->
<script lang="ts" generics="T">
	import { useChart, usePlot } from '../core/context.js';
	import { scaled } from '../core/scales.js';
	import { useTextWidth } from '../core/text.svelte.js';
	import { readableColor } from '../styles/color.js';
	import { avoidOverlap, wrapLabel } from '../transforms/labels.js';

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
		/**
		 * Colour each label like its series, darkened (or lightened on dark
		 * backgrounds) where needed to reach 4.5:1 against the background.
		 */
		colorText?: boolean;
		/** Draw the dot on the last point; turn it off when the point has a mark of its own. */
		dot?: boolean;
		class?: string;
	}

	let {
		data,
		x,
		y,
		text,
		color,
		dx = 10,
		minGap = 14,
		colorText = false,
		dot = true,
		class: className = ''
	}: Props = $props();

	const chart = useChart();
	const plot = usePlot();
	const background = $derived(chart.theme.tokens['--mz-color-bg']);

	const measure = useTextWidth();
	/** Line height of a wrapped label, in em. */
	const leading = 1.15;

	const labels = $derived.by(() => {
		const size = chart.theme.plot.fontSize;
		const width = (s: string) => measure(s, size, chart.theme.tokens['--mz-font-body']);
		const points = data.map((d) => {
			const px = scaled(plot.x, x(d));
			// Room from the label's start to the chart's right edge, less a pixel or two for the halo.
			const room = plot.width + plot.padding.right - (px + dx) - 2;
			return { d, px, py: scaled(plot.y, y(d)), lines: wrapLabel(text(d), room, width) };
		});
		const lineGap = (size * leading) / minGap;
		const placed = avoidOverlap(
			points.map((p) => p.py),
			minGap,
			[0, plot.height],
			points.map((p) => 1 + (p.lines.length - 1) * lineGap)
		);
		return points.map((p, i) => ({ ...p, ly: placed[i] }));
	});
</script>

<g class="mz-line-end-labels {className}">
	{#each labels as label}
		{#if Math.abs(label.ly - label.py) > 2}
			<path class="mz-leader" d="M{label.px + 5},{label.py}L{label.px + dx - 3},{label.ly}" />
		{/if}
		{#if dot}<circle cx={label.px} cy={label.py} r={4} fill={color(label.d)} />{/if}
		<text
			x={label.px + dx}
			y={label.ly}
			dy={label.lines.length === 1 ? '0.32em' : undefined}
			style:fill={colorText ? readableColor(color(label.d), background) : undefined}
			>{#if label.lines.length === 1}{label.lines[0]}{:else}{#each label.lines as line, i (i)}<tspan
						x={label.px + dx}
						dy={i === 0 ? `${0.32 - ((label.lines.length - 1) * leading) / 2}em` : `${leading}em`}>{line}</tspan
					>{/each}{/if}</text
		>
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
