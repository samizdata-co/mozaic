<!--
@component
Recipe: a mosaic (Marimekko) chart. One 100% stacked bar per row, with each
row as tall as its weight (by default the sum of its values), so the area of
every cell is proportional to its value: votes by district, where the
height shows how many people voted there. Row labels sit at the right, nudged
apart where rows are thin. Optional: rows sorted by the share of some series,
a reference line, and series names written once inside their largest cell.
Use it as is, or run `mozaic eject MosaicChart` to copy this file into your
project and change anything.
-->
<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import { scaleLinear } from 'd3-scale';
	import { group, sum } from 'd3-array';
	import { Chart, Header, Title, Subtitle, Footer, Source, Notes, type SourceItem } from '../frame/index.js';
	import type { ChartEmbed } from '../embed/index.js';
	import { Plot, Svg, estimateTextWidth, type PlotContext } from '../core/index.js';
	import { Rects } from '../marks/index.js';
	import { AxisX, Legend } from '../guides/index.js';
	import { RefLine } from '../annotations/index.js';
	import { avoidOverlap } from '../transforms/index.js';
	import { createLocale, type LocaleCode } from '../locale/index.js';
	import { base, contrastRatio, type Breakpoint, type Medium, type Theme } from '../styles/index.js';

	interface Props {
		/** Long format: one datum per row × series. */
		data: T[];
		row: (d: T) => string;
		series: (d: T) => string;
		value: (d: T) => number;
		/** Row height weight; defaults to the sum of the row's values. */
		weight?: (row: string) => number;
		/** Stacking order, left to right. Defaults to first appearance. */
		seriesOrder?: string[];
		/** Sort rows by the combined share of these series, largest first. Defaults to the order given. */
		sortBy?: string[];
		color?: (series: string) => string;
		seriesLabel?: (series: string) => string;
		/** Legend items; defaults to one per series. Pass [] to hide the legend. */
		legend?: { label: string; color: string }[];
		/** Series named once inside their largest cell, when the name fits. */
		labelSeries?: string[];
		/** Vertical reference line at this share (0–1), e.g. 0.5. */
		reference?: number;
		referenceLabel?: string;
		style?: Theme;
		locale?: LocaleCode;
		medium?: Medium;
		width?: number;
		title?: string;
		subtitle?: string;
		notes?: string;
		/** Plain text, or sources with optional links (see `<Source>`). */
		source?: string | SourceItem[];
		alt?: string;
		/** The chart's embed page, for the embed code under the chart (see `<Chart embed>`). */
		embed?: ChartEmbed;
		/** Share format (0–1) for tooltips; defaults to a locale percentage with one decimal. */
		format?: (share: number) => string;
		/** Plot height in px, or a function of the outer width and breakpoint. Defaults to enough room for every row label, and at least 480 px. */
		height?: number | ((size: { width: number; breakpoint: Breakpoint }) => number);
		/** Extra SVG drawn on top of the cells; receives the plot context. */
		annotations?: Snippet<[PlotContext]>;
	}

	let {
		data,
		row,
		series,
		value,
		weight,
		seriesOrder,
		sortBy,
		color,
		seriesLabel = (s) => s,
		legend,
		labelSeries = [],
		reference,
		referenceLabel,
		style = base,
		locale,
		medium,
		width,
		title,
		subtitle,
		notes,
		source,
		alt,
		embed,
		format,
		height,
		annotations
	}: Props = $props();

	const theme = $derived(style);
	const loc = $derived(createLocale(locale ?? theme.defaultLocale));
	const fmt = $derived(format ?? ((s: number) => loc.format('.1%')(s)));
	const fontSize = $derived(theme.plot.fontSize);
	const ink = $derived(theme.tokens['--mz-color-text'] ?? '#000');
	const paper = $derived(theme.tokens['--mz-color-bg'] ?? '#fff');

	const order = $derived(seriesOrder ?? [...new Set(data.map(series))]);
	const colorOf = $derived(
		(s: string) => color?.(s) ?? theme.palettes.categorical[order.indexOf(s) % theme.palettes.categorical.length]
	);
	const textOn = (fill: string) => (contrastRatio(fill, paper) >= contrastRatio(fill, ink) ? paper : ink);
	const legendItems = $derived(legend ?? order.map((s) => ({ label: seriesLabel(s), color: colorOf(s) })));

	interface Cell {
		row: string;
		series: string;
		share: number;
		/** Share axis, 0–1. */
		x0: number;
		x1: number;
		/** Cumulative weight axis, top to bottom. */
		y0: number;
		y1: number;
	}

	const layout = $derived.by(() => {
		const byRow = group(data, row);
		const rows = [...byRow].map(([name, ds]) => {
			const total = sum(ds, value);
			const share = (s: string) =>
				sum(
					ds.filter((d) => series(d) === s),
					value
				) / (total || 1);
			return { name, total, weight: weight?.(name) ?? total, share };
		});
		if (sortBy) {
			const key = (r: (typeof rows)[number]) => sum(sortBy, r.share);
			rows.sort((a, b) => key(b) - key(a));
		}
		const cells: Cell[] = [];
		const bands: { name: string; y0: number; y1: number }[] = [];
		let y = 0;
		for (const r of rows) {
			let x = 0;
			for (const s of order) {
				const share = r.share(s);
				if (share > 0) cells.push({ row: r.name, series: s, share, x0: x, x1: x + share, y0: y, y1: y + r.weight });
				x += share;
			}
			bands.push({ name: r.name, y0: y, y1: y + r.weight });
			y += r.weight;
		}
		return { cells, bands, total: y };
	});

	const x = scaleLinear().domain([0, 1]);
	const y = $derived(scaleLinear().domain([0, layout.total]));
	const plotHeight = $derived(
		height ??
			(({ width: w }: { width: number }) =>
				Math.max(480, layout.bands.length * (fontSize + 4) * 1.4, Math.min(900, w * 1.1)))
	);
	const right = $derived(Math.max(...layout.bands.map((b) => estimateTextWidth(b.name, fontSize))) + 18);

	/** Row labels at the centre of each row, nudged apart; a short tick joins a moved label to its row. */
	function rowLabels(plot: PlotContext) {
		const centres = layout.bands.map((b) => ((plot.y(b.y0) ?? 0) + (plot.y(b.y1) ?? 0)) / 2);
		const placed = avoidOverlap(centres, fontSize + 1, [fontSize / 2, plot.height - fontSize / 2]);
		return layout.bands.map((b, i) => ({ name: b.name, at: centres[i], y: placed[i] }));
	}

	/** Each labelled series named in its largest cell that holds the name. */
	function seriesLabels(plot: PlotContext) {
		return labelSeries.flatMap((s) => {
			const text = seriesLabel(s);
			const w = estimateTextWidth(text, fontSize) + 12;
			const fits = layout.cells
				.filter((c) => c.series === s)
				.map((c) => ({
					c,
					x0: plot.x(c.x0) ?? 0,
					x1: plot.x(c.x1) ?? 0,
					y0: plot.y(c.y0) ?? 0,
					y1: plot.y(c.y1) ?? 0
				}))
				.filter((r) => r.x1 - r.x0 >= w && r.y1 - r.y0 >= fontSize + 8)
				.sort((a, b) => (b.x1 - b.x0) * (b.y1 - b.y0) - (a.x1 - a.x0) * (a.y1 - a.y0));
			const best = fits[0];
			return best ? [{ text, x: (best.x0 + best.x1) / 2, y: (best.y0 + best.y1) / 2, fill: textOn(colorOf(s)) }] : [];
		});
	}
</script>

<Chart {style} {locale} {medium} {width} {alt} {embed}>
	{#if title || subtitle || legendItems.length > 1}
		<Header>
			{#if title}<Title>{title}</Title>{/if}
			{#if subtitle}<Subtitle>{subtitle}</Subtitle>{/if}
			{#if legendItems.length > 1}<Legend items={legendItems} />{/if}
		</Header>
	{/if}

	<Plot {x} {y} yRange={({ height: h }) => [0, h]} height={plotHeight} padding={{ left: 0, right, top: 0, bottom: 24 }}>
		{#snippet children(plot)}
			<Svg>
				<AxisX ticks={4} format={(v) => loc.format('.0%')(v)} />
				<Rects
					data={layout.cells}
					x={(c) => c.x0}
					x2={(c) => c.x1}
					y={(c) => c.y0}
					y2={(c) => c.y1}
					fill={(c) => colorOf(c.series)}
					stroke={paper}
					title={(c) => `${c.row} · ${seriesLabel(c.series)}: ${fmt(c.share)}`}
				/>
				{#each seriesLabels(plot) as l (l.text)}
					<text class="mz-mosaic-series" x={l.x} y={l.y} dy="0.35em" text-anchor="middle" fill={l.fill}>{l.text}</text>
				{/each}
				{#if reference !== undefined}
					<RefLine x={reference} label={referenceLabel} />
				{/if}
				{#each rowLabels(plot) as l (l.name)}
					<g class="mz-mosaic-row">
						{#if Math.abs(l.y - l.at) > 2}
							<path d="M{plot.width + 1},{l.at} L{plot.width + 5},{l.y}" />
						{/if}
						<text x={plot.width + 7} y={l.y} dy="0.35em">{l.name}</text>
					</g>
				{/each}
				{@render annotations?.(plot)}
			</Svg>
		{/snippet}
	</Plot>

	{#if notes || source}
		<Footer>
			{#if notes}<Notes>{notes}</Notes>{/if}
			{#if source}<Source sources={source} />{/if}
		</Footer>
	{/if}
</Chart>

<style>
	.mz-mosaic-row text,
	.mz-mosaic-series {
		font-family: var(--mz-font-body);
		font-size: var(--mz-size-axis);
	}
	.mz-mosaic-row text {
		fill: var(--mz-color-text);
	}
	.mz-mosaic-row path {
		fill: none;
		stroke: var(--mz-color-axis);
	}
	.mz-mosaic-series {
		font-weight: var(--mz-weight-strong);
	}
</style>
