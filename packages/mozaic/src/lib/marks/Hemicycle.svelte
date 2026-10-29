<!--
@component
A parliament chart: one dot per seat in half-rings, filled party by party
from left to right in data order, so each party gets a wedge. It fills the
plot area (no scales needed) and sits on the bottom edge.

Order the data the way the chamber reads (e.g. left to right politically,
or largest first). `majorityLine` marks the centre: a party or coalition
whose seats cross it has a majority.

```svelte
<Plot height={220}>
  <Svg>
    <Hemicycle data={parties} value={(d) => d.seats} fill={(d) => d.color} majorityLine majorityLabel="51 for a majority" />
  </Svg>
</Plot>
```
-->
<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import { useChart, usePlot } from '../core/context.js';
	import { access, type Accessor } from '../core/accessor.js';
	import { hemicycleLayout } from '../transforms/hemicycle.js';

	/** Where the hemicycle was drawn, in plot pixels; passed to the `center` snippet. */
	interface Geometry {
		cx: number;
		cy: number;
		/** Outer radius in px. */
		radius: number;
		/** Inner radius in px. */
		innerRadius: number;
	}

	interface Props {
		data: T[];
		/** Seats for each datum. */
		value: (d: T) => number;
		/** Seat colour per datum. Defaults to the categorical palette in data order. */
		fill?: Accessor<T, string>;
		opacity?: Accessor<T, number>;
		/** Total seats in the chamber. Defaults to the sum of values; extra seats use `emptyFill`. */
		total?: number;
		emptyFill?: string;
		/** Number of rows. Defaults to the fewest that fit. */
		rows?: number;
		/** Inner radius as a fraction of the outer radius. */
		innerRadius?: number;
		/** Gap between seats in px (drawn as a ring in the background colour, so hover has no holes). */
		gap?: number;
		/** Draw a line through the centre: seats that cross it hold a majority. */
		majorityLine?: boolean;
		/** Text above the centre line, e.g. "51 for a majority". */
		majorityLabel?: string;
		/** Accessible label per datum (adds a <title> to its seats). */
		title?: (d: T) => string;
		onpointerenter?: (d: T, event: PointerEvent) => void;
		onpointerleave?: (d: T, event: PointerEvent) => void;
		onclick?: (d: T, event: MouseEvent) => void;
		/** Content in the middle of the hemicycle (e.g. the total), positioned with the geometry it receives. */
		center?: Snippet<[Geometry]>;
		class?: string;
	}

	let {
		data,
		value,
		fill,
		opacity = 1,
		total,
		emptyFill = 'var(--mz-color-grid)',
		rows,
		innerRadius = 0.4,
		gap = 2,
		majorityLine = false,
		majorityLabel,
		title,
		onpointerenter,
		onpointerleave,
		onclick,
		center,
		class: className = ''
	}: Props = $props();

	const chart = useChart();
	const plot = usePlot();

	const counts = $derived(data.map((d) => Math.max(0, Math.round(value(d)))));
	const seatCount = $derived(total ?? counts.reduce((a, b) => a + b, 0));
	const layout = $derived(hemicycleLayout(seatCount, { rows, innerRadius }));

	const top = $derived(majorityLabel ? chart.theme.plot.fontSize + 8 : majorityLine ? 4 : 0);
	const radius = $derived(Math.max(0, Math.min(plot.width / 2, (plot.height - top) / (1 + layout.spacing / 2))));
	const geometry = $derived<Geometry>({
		cx: plot.width / 2,
		cy: top + radius,
		radius,
		innerRadius: radius * innerRadius
	});
	const r = $derived(Math.max(0.5, (radius * layout.spacing) / 2 - gap / 2));

	// Seats per datum, in seat order; seats beyond the data are empty.
	const groups = $derived.by(() => {
		let start = 0;
		return counts.map((count, k) => {
			const seats = layout.seats.slice(start, Math.min(start + count, layout.seats.length));
			start += count;
			return { d: data[k], k, seats };
		});
	});
	const empty = $derived(
		layout.seats.slice(
			Math.min(
				layout.seats.length,
				counts.reduce((a, b) => a + b, 0)
			)
		)
	);

	const colour = (d: T, k: number) =>
		fill !== undefined
			? access(fill, d, k)
			: chart.theme.palettes.categorical[k % chart.theme.palettes.categorical.length];
</script>

<g class="mz-hemicycle {className}">
	{#each groups as group (group.k)}
		<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
		<g
			class="mz-hemicycle-party"
			fill={colour(group.d, group.k)}
			opacity={access(opacity, group.d, group.k)}
			onpointerenter={onpointerenter ? (e) => onpointerenter(group.d, e) : undefined}
			onpointerleave={onpointerleave ? (e) => onpointerleave(group.d, e) : undefined}
			onclick={onclick ? (e) => onclick(group.d, e) : undefined}
		>
			{#if title}<title>{title(group.d)}</title>{/if}
			{#each group.seats as seat (seat.index)}
				<circle cx={geometry.cx + seat.x * radius} cy={geometry.cy - seat.y * radius} {r} stroke-width={gap} />
			{/each}
		</g>
	{/each}
	{#if empty.length}
		<g class="mz-hemicycle-empty" fill={emptyFill}>
			{#each empty as seat (seat.index)}
				<circle cx={geometry.cx + seat.x * radius} cy={geometry.cy - seat.y * radius} {r} stroke-width={gap} />
			{/each}
		</g>
	{/if}
	{#if majorityLine && radius > 0}
		<line
			class="mz-hemicycle-majority"
			x1={geometry.cx}
			x2={geometry.cx}
			y1={geometry.cy - geometry.innerRadius + r}
			y2={top - 2}
		/>
	{/if}
	{#if majorityLabel && radius > 0}
		<text class="mz-hemicycle-label" x={geometry.cx} y={chart.theme.plot.fontSize - 1} text-anchor="middle"
			>{majorityLabel}</text
		>
	{/if}
	{@render center?.(geometry)}
</g>

<style>
	circle {
		stroke: var(--mz-color-bg);
	}
	.mz-hemicycle-majority {
		stroke: var(--mz-color-text);
		stroke-width: 1;
		shape-rendering: crispEdges;
		pointer-events: none;
	}
	.mz-hemicycle-label {
		fill: var(--mz-color-muted);
		font-size: var(--mz-size-axis);
		font-family: var(--mz-font-body);
	}
</style>
