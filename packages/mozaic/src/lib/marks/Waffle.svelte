<!--
@component
A waffle chart: a grid of squares, one per unit, coloured by category in
data order. Good for parts of a whole ("37 of 100 people"). With
`origin="bottom"` the squares fill from the bottom row up, so the first
category sits at the base and waffles of different totals share a baseline.
-->
<script lang="ts" generics="T">
	import { useChart, usePlot } from '../core/context.js';

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
</script>

<g class="mz-waffle {className}">
	{#each squares as sq}
		<rect
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
			>{#if title && sq.d !== undefined}<title>{title(sq.d)}</title>{/if}</rect
		>
	{/each}
</g>
