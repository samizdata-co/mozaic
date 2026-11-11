<!--
@component
Recipe: a strip (one-axis dot plot) for comparing many items on one value,
such as a price across countries. Items sit along the x axis, nudged up and
down so they do not overlap (a beeswarm), as dots or as circular flags
(`flag`, as in ggflags). Highlighted items get a label with a leader line
above the strip; reference values (an average) get a dashed line labelled
below it. Arrows under the axis (`directions`) say what each end means, and
very soft gridlines help read values off the axis. Much shorter than a bar chart of the same items, so use it when the
reader needs the overall spread and a few named items, not every value.
`mozaic eject StripChart` copies this file into your project.
-->
<script lang="ts" generics="T">
	import { scaleLinear } from 'd3-scale';
	import { max, min } from 'd3-array';
	import { Chart, Header, Title, Subtitle, Footer, Source, Notes, type SourceItem } from '../frame/index.js';
	import type { ChartEmbed } from '../embed/index.js';
	import { Plot, Svg, Html, estimateTextWidth } from '../core/index.js';
	import { Flag } from '../marks/index.js';
	import { AxisX } from '../guides/index.js';
	import { Tooltip } from '../interactive/index.js';
	import { createLocale, type LocaleCode } from '../locale/index.js';
	import { base, readableColor, type Medium, type Theme } from '../styles/index.js';
	import { dodge } from '../transforms/index.js';

	interface Reference {
		value: number;
		label: string;
	}

	interface Props {
		data: T[];
		value: (d: T) => number;
		/** Name shown in the tooltip and in highlighted labels. */
		label: (d: T) => string;
		/** The item's flag from `@samizdata/mozaic/flags`, drawn instead of a dot. */
		flag?: (d: T) => string | null | undefined;
		/** Items to label above the strip. */
		highlight?: (d: T) => boolean;
		/** Text of a highlighted label; defaults to the name and value. */
		labelText?: (d: T) => string;
		/** Highlighted labels to set in bold, e.g. the story's own country; the rest are regular. */
		emphasize?: (d: T) => boolean;
		/** Dot colour, and the colour of the item's label (darkened to 4.5:1 where needed). */
		color?: (d: T) => string | undefined;
		/** Dashed vertical lines with a label under the strip, e.g. an average. */
		references?: Reference[];
		/** Value axis domain; defaults to zero to the largest value. */
		domain?: [number, number];
		/** Unit after the last axis tick label and the tooltip value, e.g. "c/kWh". */
		unit?: string;
		/** Axis title at the end of the value axis. Leave it out when the subtitle gives the unit. */
		axisLabel?: string;
		/**
		 * What the low and high ends of the axis mean, e.g. `["Cheaper", "More expensive"]`,
		 * drawn under the axis as "← Cheaper" and "More expensive →". Leave an end empty for a single
		 * arrow; the low end is dropped when both do not fit.
		 */
		directions?: [string, string];
		/** Very soft vertical gridlines at the ticks (default true). */
		grid?: boolean;
		/** Dot or flag radius in px; defaults to a size that keeps flags recognisable. */
		r?: number;
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
		/** Value format for labels, tooltips and references; defaults to locale numbers. */
		format?: (n: number) => string;
	}

	let {
		data,
		value,
		label,
		flag,
		highlight,
		labelText,
		emphasize,
		color,
		references = [],
		domain,
		unit,
		axisLabel,
		directions,
		grid = true,
		r: radius,
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
		format
	}: Props = $props();

	const theme = $derived(style);
	const fmt = $derived(format ?? createLocale(locale ?? theme.defaultLocale).number);
	const fontSize = $derived(theme.plot.fontSize);
	const lineHeight = $derived(Math.round(fontSize * 1.35));
	const r = $derived(radius ?? Math.round(fontSize * 0.7));
	const padding = $derived({ left: 8, right: 8, top: 0, bottom: directions ? 28 + lineHeight + 6 : 28 });
	const ticks = 5;
	const leader = 8;
	const x = $derived(
		scaleLinear()
			.domain(domain ?? [Math.min(0, min(data, value) ?? 0), max(data, value) ?? 1])
			.nice()
	);
	const textOf = (d: T) => labelText?.(d) ?? `${label(d)} ${fmt(value(d))}`;
	const labelled = $derived(highlight ? data.filter(highlight) : []);

	/** Positions of the items and labels for a plot area `w` px wide. Pure, so the height can be worked out before the plot is drawn. */
	function layout(w: number) {
		const scale = x.copy().range([0, w]);
		const xs = data.map((d) => scale(value(d)));
		const offsets = dodge(xs, r, { padding: 1 });
		const half = Math.max(0, ...offsets.map(Math.abs)) + r;
		// Labels go in rows above the strip, each in the lowest row where it fits.
		const rows: [number, number][][] = [];
		const labels = labelled
			.map((d) => ({ d, text: textOf(d), cx: scale(value(d)) }))
			.sort((a, b) => a.cx - b.cx)
			.map((l) => {
				const wl = estimateTextWidth(l.text, fontSize);
				const left = Math.max(0, Math.min(w - wl, l.cx - wl / 2));
				let row = rows.findIndex((spans) => spans.every(([a, b]) => left > b + 8 || left + wl < a - 8));
				if (row < 0) row = rows.push([]) - 1;
				rows[row].push([left, left + wl]);
				return { ...l, tx: left + wl / 2, row };
			});
		const band = rows.length ? rows.length * lineHeight + leader : 0;
		const centre = band + half;
		const below = references.length ? lineHeight + 4 : 0;
		return { scale, xs, offsets, half, labels, band, centre, height: band + half * 2 + below };
	}

	const plotHeight = (size: { width: number }) => layout(size.width - padding.left - padding.right).height;
	const ink = (d: T) => {
		const c = color?.(d);
		return c ? readableColor(c, theme.tokens['--mz-color-bg']) : 'var(--mz-color-text)';
	};
	let hovered = $state<number | null>(null);
</script>

<Chart {style} {locale} {medium} {width} {alt} {embed}>
	{#if title || subtitle}
		<Header>
			{#if title}<Title>{title}</Title>{/if}
			{#if subtitle}<Subtitle>{subtitle}</Subtitle>{/if}
		</Header>
	{/if}

	<Plot {x} height={plotHeight} {padding}>
		{#snippet children(plot)}
			{@const L = layout(plot.width)}
			<Svg>
				{#if grid}
					{#each x.ticks(ticks) as tick (tick)}
						{@const gx = L.scale(tick)}
						<line class="mz-strip-grid" x1={gx} x2={gx} y1={L.band} y2={plot.height} />
					{/each}
				{/if}
				<AxisX {ticks} label={axisLabel} {unit} />
				{#if directions}
					{@const dy = plot.height + 28 + lineHeight}
					{@const [low, high] = directions}
					{@const both =
						estimateTextWidth(`← ${low}`, fontSize) + estimateTextWidth(`${high} →`, fontSize) + 24 < plot.width}
					{#if low && (both || !high)}
						<text class="mz-strip-direction" x={0} y={dy} font-size={fontSize}>← {low}</text>
					{/if}
					{#if high}
						<text class="mz-strip-direction" x={plot.width} y={dy} text-anchor="end" font-size={fontSize}>{high} →</text
						>
					{/if}
				{/if}
				{#each references as ref (ref.label)}
					{@const rx = L.scale(ref.value)}
					<line
						class="mz-strip-ref"
						x1={rx}
						x2={rx}
						y1={L.band}
						y2={L.centre + L.half}
						stroke="var(--mz-color-muted)"
						stroke-dasharray="3 3"
					/>
					<text
						class="mz-strip-ref-label"
						x={rx}
						y={L.centre + L.half + lineHeight}
						text-anchor="middle"
						font-size={fontSize}>{ref.label}</text
					>
				{/each}
				{#each data as d, i (i)}
					{@const cx = L.xs[i]}
					{@const cy = L.centre + L.offsets[i]}
					{@const svg = flag?.(d)}
					{@const on = highlight?.(d) ?? false}
					{#if svg}
						<Flag
							{svg}
							{cx}
							{cy}
							{r}
							stroke={on ? 'var(--mz-color-text)' : undefined}
							strokeWidth={on ? 1.5 : 1}
							title={label(d)}
							opacity={hovered != null && hovered !== i ? 0.5 : 1}
							onpointerenter={() => (hovered = i)}
							onpointerleave={() => (hovered = null)}
						/>
					{:else}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<circle
							{cx}
							{cy}
							{r}
							fill={color?.(d) ?? theme.palettes.categorical[0]}
							stroke="var(--mz-color-bg)"
							opacity={hovered != null && hovered !== i ? 0.5 : 1}
							onpointerenter={() => (hovered = i)}
							onpointerleave={() => (hovered = null)}><title>{label(d)}</title></circle
						>
					{/if}
				{/each}
				{#each L.labels as l (l.text)}
					{@const i = data.indexOf(l.d)}
					{@const ty = L.band - leader - l.row * lineHeight}
					<line
						class="mz-strip-leader"
						x1={l.cx}
						x2={l.cx}
						y1={ty + 3}
						y2={L.centre + L.offsets[i] - r}
						stroke="var(--mz-color-muted)"
						stroke-width="0.75"
					/>
					<text
						class="mz-strip-label"
						x={l.tx}
						y={ty}
						text-anchor="middle"
						font-size={fontSize}
						style:font-weight={emphasize?.(l.d) ? 'var(--mz-weight-strong)' : undefined}
						fill={ink(l.d)}>{l.text}</text
					>
				{/each}
			</Svg>
			<Html>
				{#if hovered != null}
					<Tooltip x={L.xs[hovered]} y={L.centre + L.offsets[hovered]}>
						<strong>{label(data[hovered])}</strong><br />{fmt(value(data[hovered]))}{unit ? ` ${unit}` : ''}
					</Tooltip>
				{/if}
			</Html>
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
	.mz-strip-grid {
		stroke: var(--mz-color-grid);
		stroke-width: 1;
		opacity: 0.5;
		shape-rendering: crispEdges;
	}
	.mz-strip-direction {
		fill: var(--mz-color-muted);
		font-family: var(--mz-font-body);
		font-style: italic;
	}
	.mz-strip-ref-label {
		fill: var(--mz-color-muted);
		font-family: var(--mz-font-body);
	}
	.mz-strip-label {
		font-family: var(--mz-font-body);
	}
</style>
