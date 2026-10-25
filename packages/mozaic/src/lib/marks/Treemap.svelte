<!--
@component
A squarified treemap filling the plot area. Labels are drawn only where
they fit. Optionally grouped one level deep (`group`).
-->
<script lang="ts" generics="T">
	import { useChart, usePlot } from '../core/context.js';
	import { estimateTextWidth } from '../core/scales.js';
	import { treemapLayout, type TreemapCell } from '../transforms/treemap.js';

	interface Props {
		data: T[];
		value: (d: T) => number;
		group?: (d: T) => string;
		fill?: (d: T, group: string | undefined) => string;
		label?: (d: T) => string;
		/** Second label line, e.g. the formatted value. */
		sublabel?: (d: T) => string;
		/** Text colour inside cells; pick one with enough contrast against the fills. */
		labelColor?: string;
		padding?: number;
		title?: (d: T) => string;
		/** Also receives the cell's pixel box, e.g. to place a tooltip at its centre. */
		onpointerenter?: (d: T, event: PointerEvent, cell: TreemapCell<T>) => void;
		onpointerleave?: (d: T, event: PointerEvent, cell: TreemapCell<T>) => void;
		class?: string;
	}

	let {
		data,
		value,
		group,
		fill,
		label,
		sublabel,
		labelColor = '#ffffff',
		padding = 1,
		title,
		onpointerenter,
		onpointerleave,
		class: className = ''
	}: Props = $props();

	const chart = useChart();
	const plot = usePlot();

	const cells = $derived(treemapLayout(data, { value, group, width: plot.width, height: plot.height, padding }));
	const groupNames = $derived([...new Set(cells.map((c) => c.group))]);
	const size = $derived(chart.theme.plot.fontSize);

	function colour(cell: TreemapCell<T>): string {
		if (fill) return fill(cell.datum, cell.group);
		const palette = chart.theme.palettes.categorical;
		return palette[Math.max(0, groupNames.indexOf(cell.group)) % palette.length];
	}

	function fits(cell: TreemapCell<T>, text: string, lines: number): boolean {
		return cell.x1 - cell.x0 >= estimateTextWidth(text, size) + 8 && cell.y1 - cell.y0 >= size * 1.3 * lines + 6;
	}
</script>

<g class="mz-treemap {className}">
	{#each cells as cell}
		{@const main = label?.(cell.datum) ?? ''}
		{@const sub = sublabel?.(cell.datum) ?? ''}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<g
			transform="translate({cell.x0},{cell.y0})"
			onpointerenter={onpointerenter ? (e) => onpointerenter(cell.datum, e, cell) : undefined}
			onpointerleave={onpointerleave ? (e) => onpointerleave(cell.datum, e, cell) : undefined}
		>
			<rect width={cell.x1 - cell.x0} height={cell.y1 - cell.y0} fill={colour(cell)}
				>{#if title}<title>{title(cell.datum)}</title>{/if}</rect
			>
			{#if main && fits(cell, main, sub ? 2 : 1)}
				<text x={4} y={4} dy="0.9em" style:fill={labelColor} font-size={size}>
					<tspan x={4} style:font-weight="var(--mz-weight-strong)">{main}</tspan>
					{#if sub && fits(cell, sub, 2)}<tspan x={4} dy="1.25em">{sub}</tspan>{/if}
				</text>
			{/if}
		</g>
	{/each}
</g>

<style>
	text {
		pointer-events: none;
	}
</style>
