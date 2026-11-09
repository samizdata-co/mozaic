<!--
@component
A waffle chart: a grid of squares, one per unit, coloured by category in
data order. Good for parts of a whole ("37 of 100 people"). With
`origin="bottom"` the squares fill from the bottom row up, so the first
category sits at the base and waffles of different totals share a baseline.
Pointing at (or tapping) a category's squares highlights them and dims the
rest; `bind:active` to share the highlight with a legend or another waffle.
-->
<script lang="ts" generics="T">
	import { useChart, usePlot } from '../core/context.js';
	import { touchHold } from '../interactive/touch-hold.js';

	interface Props {
		data: T[];
		value: (d: T) => number;
		fill?: (d: T, index: number) => string;
		/** Squares per row. */
		columns?: number;
		/** Total number of squares; defaults to the sum of values. Remaining squares use `emptyFill`. */
		total?: number;
		emptyFill?: string;
		/** Gap between squares in px. */
		gap?: number;
		/** Row the squares start filling from: the top (default) or the bottom of the plot. */
		origin?: 'top' | 'bottom';
		title?: (d: T) => string;
		/** Index of the highlighted category (in `data`), or null. Set by the pointer; bind to it to link a legend. */
		active?: number | null;
		/** Opacity of the other categories while one is highlighted. */
		dim?: number;
		/** Highlight categories under the pointer. Off in print. */
		interactive?: boolean;
		class?: string;
	}

	let {
		data,
		value,
		fill,
		columns = 10,
		total,
		emptyFill = 'var(--mz-color-grid)',
		gap = 2,
		origin = 'top',
		title,
		active = $bindable(null),
		dim = 0.25,
		interactive = true,
		class: className = ''
	}: Props = $props();

	const chart = useChart();
	const plot = usePlot();

	const counts = $derived(data.map((d) => Math.max(0, Math.round(value(d)))));
	const count = $derived(total ?? counts.reduce((a, b) => a + b, 0));
	const rows = $derived(Math.ceil(count / columns));
	const cell = $derived(Math.max(0, Math.min(plot.width / columns, plot.height / Math.max(1, rows))));
	const squares = $derived.by(() => {
		const out: { i: number; d: T | undefined; k: number }[] = [];
		let i = 0;
		counts.forEach((c, k) => {
			for (let n = 0; n < c && i < count; n++) out.push({ i: i++, d: data[k], k });
		});
		while (i < count) out.push({ i: i++, d: undefined, k: -1 });
		return out;
	});

	const live = $derived(interactive && plot.medium !== 'print');
	let group = $state<SVGGElement>();
	const hold = touchHold(
		() => group,
		() => (active = null)
	);
	$effect(() => hold.destroy);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<g
	bind:this={group}
	class="mz-waffle {className}"
	class:mz-waffle-live={live}
	onpointerdown={live ? hold.down : undefined}
	onpointercancel={live ? hold.cancel : undefined}
	onpointerleave={live ? hold.leave : undefined}
>
	{#if live}
		<!-- Catches the pointer in the gaps, so moving between squares does not clear the highlight. -->
		<rect
			class="mz-waffle-bg"
			y={origin === 'bottom' ? plot.height - rows * cell : 0}
			width={columns * cell}
			height={rows * cell}
			fill="transparent"
		/>
	{/if}
	{#each squares as sq}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<rect
			class="mz-waffle-square"
			x={(sq.i % columns) * cell + gap / 2}
			y={(origin === 'bottom'
				? plot.height - (Math.floor(sq.i / columns) + 1) * cell
				: Math.floor(sq.i / columns) * cell) +
				gap / 2}
			width={Math.max(0, cell - gap)}
			height={Math.max(0, cell - gap)}
			fill={sq.d === undefined
				? emptyFill
				: fill
					? fill(sq.d, sq.k)
					: chart.theme.palettes.categorical[sq.k % chart.theme.palettes.categorical.length]}
			opacity={active !== null && active !== undefined && sq.k !== active ? dim : 1}
			onpointerenter={live ? () => (active = sq.d === undefined ? null : sq.k) : undefined}
			>{#if title && sq.d !== undefined}<title>{title(sq.d)}</title>{/if}</rect
		>
	{/each}
</g>

<style>
	.mz-waffle-live rect {
		transition: opacity 120ms;
	}
</style>
