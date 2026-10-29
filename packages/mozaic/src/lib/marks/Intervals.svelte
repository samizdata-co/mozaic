<!--
@component
A range per category with an optional point estimate: confidence
intervals, poll averages with their margin, forecast seat ranges, min–max.
Pass `x1`/`x2` (and `x`) with a band y scale for horizontal ranges, or
`y1`/`y2` (and `y`) with a band x scale for vertical ones.

The range is a light bar in the series colour with round ends; the estimate
is a dot with a ring in the background colour.
-->
<script lang="ts" generics="T">
	import { useChart, usePlot } from '../core/context.js';
	import { scaled } from '../core/scales.js';
	import { access, type Accessor, type Value } from '../core/accessor.js';

	interface Props {
		data: T[];
		/** Category (vertical ranges) or point estimate (horizontal ranges). */
		x?: Accessor<T, Value>;
		/** Category (horizontal ranges) or point estimate (vertical ranges). */
		y?: Accessor<T, Value>;
		/** Start of a horizontal range. */
		x1?: (d: T) => number;
		/** End of a horizontal range. */
		x2?: (d: T) => number;
		/** Start of a vertical range. */
		y1?: (d: T) => number;
		/** End of a vertical range. */
		y2?: (d: T) => number;
		fill?: Accessor<T, string>;
		/** Opacity of the range bar (the dot is opaque). */
		rangeOpacity?: number;
		/** Range bar thickness in px, capped at the band width. */
		thickness?: number;
		/** Dot radius in px; 0 hides the dot. */
		r?: number;
		/** Accessible label per datum (adds a <title>). */
		title?: (d: T) => string;
		onpointerenter?: (d: T, event: PointerEvent) => void;
		onpointerleave?: (d: T, event: PointerEvent) => void;
		class?: string;
	}

	let {
		data,
		x,
		y,
		x1,
		x2,
		y1,
		y2,
		fill,
		rangeOpacity = 0.3,
		thickness = 10,
		r = 5,
		title,
		onpointerenter,
		onpointerleave,
		class: className = ''
	}: Props = $props();

	const chart = useChart();
	const plot = usePlot();

	const horizontal = $derived(x1 !== undefined && x2 !== undefined);
	const band = $derived(horizontal ? plot.y : plot.x);
	const size = $derived(Math.min(thickness, Math.max(2, band.bandwidth?.() ?? thickness)));

	const shapes = $derived(
		data.map((d, i) => {
			const colour = fill !== undefined ? access(fill, d, i) : chart.theme.palettes.categorical[0];
			if (horizontal) {
				const cy = scaled(plot.y, y === undefined ? undefined : access(y, d, i));
				const [a, b] = [scaled(plot.x, x1!(d)), scaled(plot.x, x2!(d))].sort((p, q) => p - q);
				const dot = x === undefined ? null : scaled(plot.x, access(x, d, i));
				return {
					d,
					colour,
					rect: { x: a, y: cy - size / 2, width: b - a, height: size },
					dot: dot === null ? null : [dot, cy]
				};
			}
			const cx = scaled(plot.x, x === undefined ? undefined : access(x, d, i));
			const [a, b] = [scaled(plot.y, y1!(d)), scaled(plot.y, y2!(d))].sort((p, q) => p - q);
			const dot = y === undefined ? null : scaled(plot.y, access(y, d, i));
			return {
				d,
				colour,
				rect: { x: cx - size / 2, y: a, width: size, height: b - a },
				dot: dot === null ? null : [cx, dot]
			};
		})
	);
</script>

<g class="mz-intervals {className}">
	{#each shapes as s, i (i)}
		{#if Number.isFinite(s.rect.x) && Number.isFinite(s.rect.y)}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<g
				onpointerenter={onpointerenter ? (e) => onpointerenter(s.d, e) : undefined}
				onpointerleave={onpointerleave ? (e) => onpointerleave(s.d, e) : undefined}
			>
				{#if title}<title>{title(s.d)}</title>{/if}
				<rect
					class="mz-interval-range"
					x={s.rect.x}
					y={s.rect.y}
					width={Math.max(size, s.rect.width)}
					height={Math.max(size, s.rect.height)}
					rx={size / 2}
					fill={s.colour}
					opacity={rangeOpacity}
				/>
				{#if s.dot && r > 0 && Number.isFinite(s.dot[0]) && Number.isFinite(s.dot[1])}
					<circle class="mz-interval-dot" cx={s.dot[0]} cy={s.dot[1]} {r} fill={s.colour} />
				{/if}
			</g>
		{/if}
	{/each}
</g>

<style>
	.mz-interval-dot {
		stroke: var(--mz-color-bg);
		stroke-width: 2;
	}
</style>
