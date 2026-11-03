<!--
@component
Recipe: 100% stacked bars. One horizontal bar per row, split into the share
of each series, with the series name and share written inside segments wide
enough to hold them. Optional: a reference line (e.g. at 50%), brackets above
the first bar that group neighbouring series ("pro-European", "pro-Russian"),
and a legend that lists groups of series instead of every series.
Use it as is, or run `mozaic eject StackedBarChart` to copy this file into
your project and change anything.
-->
<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import { scaleBand, scaleLinear } from 'd3-scale';
	import { Chart, Header, Title, Subtitle, Footer, Source, Notes } from '../frame/index.js';
	import type { ChartEmbed } from '../embed/index.js';
	import { Plot, Svg, estimateTextWidth, scaled, type PlotContext } from '../core/index.js';
	import { Rects } from '../marks/index.js';
	import { AxisX, AxisY, Legend } from '../guides/index.js';
	import { RefLine } from '../annotations/index.js';
	import { stack } from '../transforms/index.js';
	import { createLocale, type LocaleCode } from '../locale/index.js';
	import { base, contrastRatio, type Medium, type Theme } from '../styles/index.js';

	interface Group {
		label: string;
		/** First and last series of the group, in stacking order. */
		from: string;
		to: string;
	}

	interface Props {
		/** Long format: one datum per row × series. */
		data: T[];
		row: (d: T) => string;
		series: (d: T) => string;
		value: (d: T) => number;
		/** Stacking order, left to right. Defaults to first appearance. */
		seriesOrder?: string[];
		/** Segment colour per series; defaults to the categorical palette. */
		color?: (series: string) => string;
		/** Name written inside segments and in the default legend; defaults to the series key. */
		seriesLabel?: (series: string) => string;
		/** Legend items; defaults to one per series. Pass [] to hide the legend. */
		legend?: { label: string; color: string }[];
		/** Brackets above the first bar. */
		groups?: Group[];
		/** Vertical reference line at this share (0–1), e.g. 0.5. */
		reference?: number;
		referenceLabel?: string;
		/** Smallest share that gets a label inside its segment (it must also fit). */
		labelMin?: number;
		style?: Theme;
		locale?: LocaleCode;
		medium?: Medium;
		width?: number;
		title?: string;
		subtitle?: string;
		notes?: string;
		source?: string;
		alt?: string;
		/** The chart's embed page, for the embed code under the chart (see `<Chart embed>`). */
		embed?: ChartEmbed;
		/** Share format (0–1); defaults to a locale percentage with one decimal. */
		format?: (share: number) => string;
		rowHeight?: number;
		/** Extra SVG drawn on top of the bars; receives the plot context. */
		annotations?: Snippet<[PlotContext]>;
	}

	let {
		data,
		row,
		series,
		value,
		seriesOrder,
		color,
		seriesLabel = (s) => s,
		legend,
		groups = [],
		reference,
		referenceLabel,
		labelMin = 0.08,
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
		rowHeight = 64,
		annotations
	}: Props = $props();

	const theme = $derived(style);
	const loc = $derived(createLocale(locale ?? theme.defaultLocale));
	const fmt = $derived(format ?? ((s: number) => loc.format('.1%')(s)));
	const fontSize = $derived(theme.plot.fontSize);
	const ink = $derived(theme.tokens['--mz-color-text'] ?? '#000');
	const paper = $derived(theme.tokens['--mz-color-bg'] ?? '#fff');

	const segments = $derived(stack(data, { key: row, series, value, seriesOrder, offset: 'expand' }));
	const order = $derived(seriesOrder ?? [...new Set(data.map(series))]);
	const colorOf = $derived(
		(s: string) => color?.(s) ?? theme.palettes.categorical[order.indexOf(s) % theme.palettes.categorical.length]
	);
	/** Ink or paper, whichever reads better on the segment. */
	const textOn = (fill: string) => (contrastRatio(fill, paper) >= contrastRatio(fill, ink) ? paper : ink);
	const legendItems = $derived(legend ?? order.map((s) => ({ label: seriesLabel(s), color: colorOf(s) })));

	const rows = $derived([...new Set(data.map(row))]);
	const single = $derived(rows.length === 1);
	const x = scaleLinear().domain([0, 1]);
	const y = $derived(scaleBand<string>().domain(rows).paddingInner(0.25));
	const left = $derived(single ? 0 : Math.max(...rows.map((r) => estimateTextWidth(r, fontSize))) + 12);
	const bracketSpace = $derived(groups.length ? fontSize + 14 : 0);

	/** Segment labels: name over value, when both lines fit the segment. */
	function segmentLabel(plot: PlotContext, s: (typeof segments)[number]) {
		const w = (plot.x(s.end) ?? 0) - (plot.x(s.start) ?? 0);
		const name = seriesLabel(s.series);
		const share = fmt(s.end - s.start);
		const needed = Math.max(estimateTextWidth(name, fontSize), estimateTextWidth(share, fontSize)) + 8;
		const tall = plot.y.bandwidth!() >= fontSize * 2.6;
		if (s.end - s.start < labelMin || w < needed || !tall) return null;
		return { x: plot.x((s.start + s.end) / 2) ?? 0, name, share };
	}

	/** Brackets over the first bar, labels kept inside the plot. */
	function brackets(plot: PlotContext) {
		const first = segments.filter((s) => s.key === rows[0]);
		return groups.flatMap((g) => {
			const a = first.find((s) => s.series === g.from);
			const b = first.find((s) => s.series === g.to);
			if (!a || !b) return [];
			const x0 = (plot.x(a.start) ?? 0) + 1;
			const x1 = (plot.x(b.end) ?? 0) - 1;
			const half = estimateTextWidth(g.label, fontSize) / 2;
			const mid = Math.min(plot.width - half, Math.max(half, (x0 + x1) / 2));
			return [{ label: g.label, x0, x1, mid }];
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

	<Plot {x} {y} height={rows.length * rowHeight} padding={{ left, right: 4, top: bracketSpace, bottom: 24 }}>
		{#snippet children(plot)}
			<Svg>
				<AxisX ticks={4} format={(v) => loc.format('.0%')(v)} />
				{#if !single}<AxisY />{/if}
				<Rects
					data={segments}
					x={(s) => s.start}
					x2={(s) => s.end}
					y={(s) => s.key as string}
					fill={(s) => colorOf(s.series)}
					stroke={paper}
					title={(s) => `${single ? '' : `${s.key} · `}${seriesLabel(s.series)}: ${fmt(s.end - s.start)}`}
				/>
				{#each segments as s (`${s.key}\u0000${s.series}`)}
					{@const l = segmentLabel(plot, s)}
					{#if l}
						{@const cy = scaled(plot.y, s.key)}
						<text class="mz-stacked-label" x={l.x} y={cy} fill={textOn(colorOf(s.series))} text-anchor="middle">
							<tspan x={l.x} dy="-0.25em">{l.name}</tspan>
							<tspan class="strong" x={l.x} dy="1.2em">{l.share}</tspan>
						</text>
					{/if}
				{/each}
				{#if reference !== undefined}
					<RefLine x={reference} label={referenceLabel} />
				{/if}
				{#each brackets(plot) as b (b.label)}
					<g class="mz-stacked-bracket">
						<path d="M{b.x0},-2 v-5 H{b.x1} v5" />
						<text x={b.mid} y={-11} text-anchor="middle">{b.label}</text>
					</g>
				{/each}
				{@render annotations?.(plot)}
			</Svg>
		{/snippet}
	</Plot>

	{#if notes || source}
		<Footer>
			{#if notes}<Notes>{notes}</Notes>{/if}
			{#if source}<Source>{source}</Source>{/if}
		</Footer>
	{/if}
</Chart>

<style>
	.mz-stacked-label,
	.mz-stacked-bracket text {
		font-family: var(--mz-font-body);
		font-size: var(--mz-size-axis);
		font-variant-numeric: tabular-nums;
	}
	.mz-stacked-bracket text {
		fill: var(--mz-color-text);
		font-weight: var(--mz-weight-strong);
	}
	.mz-stacked-bracket path {
		fill: none;
		stroke: var(--mz-color-text);
		stroke-width: 1.5;
	}
	.strong {
		font-weight: var(--mz-weight-strong);
	}
</style>
