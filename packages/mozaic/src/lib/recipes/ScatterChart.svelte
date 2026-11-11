<!--
@component
Recipe: a scatter plot with optional bubble sizes, colour groups, labels for
selected points and a nearest-point tooltip. Pass `flag` to draw countries as
circular flags, as in ggflags. `quadrants` splits the plot at two reference
values (an average, a target) with dashed lines and says in each corner what
that quarter means, so readers know where "good" and "bad" are. `directions`
puts arrows on the axes ("Richer →"); with quadrants they replace the quarter
labels on charts too narrow for them. `mozaic eject ScatterChart`
copies this file into your project.
-->
<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import { scaleLinear, scaleSqrt } from 'd3-scale';
	import { extent, max } from 'd3-array';
	import { Chart, Header, Title, Subtitle, Footer, Source, Notes, type SourceItem } from '../frame/index.js';
	import type { ChartEmbed } from '../embed/index.js';
	import { Plot, Svg, Html, estimateTextWidth, type PlotContext } from '../core/index.js';
	import { wrapLabel } from '../transforms/index.js';
	import { Flags, Points, Voronoi } from '../marks/index.js';
	import { AxisX, AxisY, GridX, GridY, Legend } from '../guides/index.js';
	import { Label, RefLine } from '../annotations/index.js';
	import { Tooltip } from '../interactive/index.js';
	import { createLocale, type LocaleCode } from '../locale/index.js';
	import { base, type Medium, type Theme } from '../styles/index.js';

	interface Quadrants {
		/** Where the vertical and horizontal dividing lines cross, in data units. */
		x: number;
		y: number;
		/** Labels for the dividing lines, e.g. "EU average". */
		xLabel?: string;
		yLabel?: string;
		/** What each quarter means, written in its outer corner. Newlines split a label; long lines wrap to fit the quarter. */
		topLeft?: string;
		topRight?: string;
		bottomLeft?: string;
		bottomRight?: string;
	}

	interface Props {
		data: T[];
		x: (d: T) => number;
		y: (d: T) => number;
		/** Name shown in the tooltip and labels. */
		name: (d: T) => string;
		/** Optional size value (bubble chart). */
		size?: (d: T) => number;
		/** Optional colour group. */
		group?: (d: T) => string;
		/** The point's flag from `@samizdata/mozaic/flags`, drawn instead of a dot (rows without one keep their dot). */
		flag?: (d: T) => string | null | undefined;
		/** Labels to set in bold, e.g. the story's own country. */
		emphasize?: (d: T) => boolean;
		/** Points to label permanently. */
		labelled?: (d: T) => boolean;
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
		xLabel?: string;
		yLabel?: string;
		xFormat?: (n: number) => string;
		yFormat?: (n: number) => string;
		/** Units after the last tick label of each axis and the tooltip values, e.g. "euro a year". */
		xUnit?: string;
		yUnit?: string;
		/** Axis domains; default to the data's extent, rounded. Start at zero to leave room in the corners. */
		xDomain?: [number, number];
		yDomain?: [number, number];
		/** Dashed dividing lines and a label for each quarter (see `Quadrants`). */
		quadrants?: Quadrants;
		/**
		 * What the low and high ends of each axis mean, e.g. `{ x: ['Poorer', 'Richer'] }`: "← Poorer"
		 * and "Richer →" under the x axis, "↑ …" and "↓ …" inside the top and bottom left corners.
		 * With `quadrants`, drawn only when the quarter labels don't fit (narrow charts). Leave an end
		 * empty (`['', 'Richer']`) for a single arrow; the low end is dropped when both don't fit.
		 */
		directions?: { x?: [string, string]; y?: [string, string] };
		height?: number;
		annotations?: Snippet<[PlotContext]>;
	}

	let {
		data,
		x: xValue,
		y: yValue,
		name,
		size,
		group,
		flag,
		labelled,
		emphasize,
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
		xLabel,
		yLabel,
		xFormat,
		yFormat,
		xUnit,
		yUnit,
		xDomain,
		yDomain,
		quadrants,
		directions,
		height = 360,
		annotations
	}: Props = $props();

	const theme = $derived(style);
	const loc = $derived(createLocale(locale ?? theme.defaultLocale));
	const x = $derived(
		scaleLinear()
			.domain(xDomain ?? (extent(data, xValue) as [number, number]))
			.nice()
	);
	const y = $derived(
		scaleLinear()
			.domain(yDomain ?? (extent(data, yValue) as [number, number]))
			.nice()
	);
	const r = $derived(
		size
			? scaleSqrt()
					.domain([0, max(data, size) ?? 1])
					.range([0, 18])
			: () => 5
	);
	/** Radius of a point: its bubble size, or larger for flags so they stay recognisable. */
	const radius = (d: T) => (size ? r(size(d)) : flag?.(d) ? Math.round(theme.plot.fontSize * 0.75) : 5);
	const groups = $derived(group ? [...new Set(data.map(group))] : []);
	const colour = (d: T) =>
		group
			? theme.palettes.categorical[groups.indexOf(group(d)) % theme.palettes.categorical.length]
			: theme.palettes.categorical[0];
	const corners = $derived(
		quadrants
			? (
					[
						['topLeft', 'start', 'top'],
						['topRight', 'end', 'top'],
						['bottomLeft', 'start', 'bottom'],
						['bottomRight', 'end', 'bottom']
					] as const
				).flatMap(([key, anchor, edge]) => {
					const text = quadrants[key];
					return text ? [{ key, text, anchor, edge }] : [];
				})
			: []
	);
	const basePadding = { left: 44, right: 16, top: 16, bottom: 36 };
	const lineHeight = $derived(Math.round(theme.plot.fontSize * 1.25));
	/** Quarter labels laid out for a plot area `w` px wide, and whether they fit without extra lines. */
	function cornerLayout(w: number) {
		if (!quadrants) return { items: [], fits: false };
		const split = x.copy().range([0, w])(quadrants.x);
		const items = corners.map((c) => {
			const room = Math.max(40, (c.anchor === 'start' ? split : w - split) - 18);
			const given = c.text.split('\n');
			const lines = given.flatMap((t) => wrapLabel(t, room, (s) => estimateTextWidth(s, theme.plot.fontSize)));
			return { ...c, lines, fits: lines.length <= Math.max(2, given.length) };
		});
		return { items, fits: items.every((c) => c.fits) };
	}
	/** Arrows on the axes: always without quadrants, otherwise only in place of quarter labels that don't fit. */
	const showDirections = (w: number) => !!directions && (!quadrants || !cornerLayout(w).fits);
	const padding = (size: { width: number }) => {
		const w = size.width - basePadding.left - basePadding.right;
		return showDirections(w) && directions?.x
			? { ...basePadding, bottom: basePadding.bottom + lineHeight + 6 }
			: basePadding;
	};
	const withUnit = (s: string, unit?: string) => (unit ? `${s} ${unit}` : s);
	// Raw, not a proxy: marks compare the hovered row with each datum by identity.
	let hovered = $state.raw<T | null>(null);
</script>

<Chart {style} {locale} {medium} {width} {alt} {embed}>
	<Header>
		{#if title}<Title>{title}</Title>{/if}
		{#if subtitle}<Subtitle>{subtitle}</Subtitle>{/if}
		{#if groups.length > 1}
			<Legend
				shape="circle"
				items={groups.map((g, i) => ({
					label: g,
					color: theme.palettes.categorical[i % theme.palettes.categorical.length]
				}))}
			/>
		{/if}
	</Header>

	<Plot {x} {y} {height} {padding}>
		{#snippet children(plot)}
			{@const layout = cornerLayout(plot.width)}
			{@const arrows = showDirections(plot.width)}
			<Svg>
				<GridX ticks={5} />
				<GridY ticks={5} />
				<AxisX ticks={5} format={xFormat} label={xLabel} unit={xUnit} />
				<AxisY ticks={5} format={yFormat} label={yLabel} unit={yUnit} />
				{#if arrows && directions?.x}
					{@const dy = plot.height + 36 + lineHeight}
					{@const [low, high] = directions.x}
					{@const both =
						estimateTextWidth(`← ${low}`, theme.plot.fontSize) +
							estimateTextWidth(`${high} →`, theme.plot.fontSize) +
							24 <
						plot.width}
					{#if low && (both || !high)}
						<text class="mz-direction" x={0} y={dy} font-size={theme.plot.fontSize}>← {low}</text>
					{/if}
					{#if high}
						<text class="mz-direction" x={plot.width} y={dy} text-anchor="end" font-size={theme.plot.fontSize}
							>{high} →</text
						>
					{/if}
				{/if}
				{#if arrows && directions?.y}
					{#if directions.y[1]}
						<text class="mz-direction" x={6} y={6 + theme.plot.fontSize} font-size={theme.plot.fontSize}
							>↑ {directions.y[1]}</text
						>
					{/if}
					{#if directions.y[0]}
						<text class="mz-direction" x={6} y={plot.height - 6} font-size={theme.plot.fontSize}
							>↓ {directions.y[0]}</text
						>
					{/if}
				{/if}
				{#if quadrants}
					<RefLine x={quadrants.x} label={quadrants.xLabel} labelY={4} />
					<RefLine y={quadrants.y} label={quadrants.yLabel} />
					{#if layout.fits}
						{#each layout.items as c (c.key)}
							{@const cx = c.anchor === 'start' ? 6 : plot.width - 6}
							{@const top =
								c.edge === 'top' ? 6 + theme.plot.fontSize : plot.height - 6 - (c.lines.length - 1) * lineHeight}
							<text class="mz-quadrant" x={cx} y={top} text-anchor={c.anchor} font-size={theme.plot.fontSize}>
								{#each c.lines as line, k (k)}<tspan x={cx} dy={k ? lineHeight : 0}>{line}</tspan>{/each}
							</text>
						{/each}
					{/if}
				{/if}
				<Points
					data={flag ? data.filter((d) => !flag(d)) : data}
					x={xValue}
					y={yValue}
					r={radius}
					fill={colour}
					opacity={(d) => (hovered && hovered !== d ? 0.35 : size ? 0.75 : 0.9)}
				/>
				{#if flag}
					<Flags
						{data}
						x={xValue}
						y={yValue}
						{flag}
						r={radius}
						title={name}
						opacity={(d) => (hovered && hovered !== d ? 0.5 : 1)}
					/>
				{/if}
				{#if labelled}
					{#each data.filter(labelled) as d}
						<Label x={xValue(d)} y={yValue(d)} label={name(d)} dx={radius(d) + 4} bold={emphasize?.(d) ?? false} />
					{/each}
				{/if}
				{@render annotations?.(plot)}
				<Voronoi
					{data}
					x={xValue}
					y={yValue}
					onpointerenter={(d) => (hovered = d)}
					onpointerleave={() => (hovered = null)}
				/>
			</Svg>
			<Html>
				{#if hovered}
					<Tooltip
						x={plot.x(xValue(hovered)) ?? 0}
						y={plot.y(yValue(hovered)) ?? 0}
						title={name(hovered)}
						items={[
							{ label: xLabel ?? 'x', value: withUnit((xFormat ?? loc.number)(xValue(hovered)), xUnit) },
							{ label: yLabel ?? 'y', value: withUnit((yFormat ?? loc.number)(yValue(hovered)), yUnit) }
						]}
					/>
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
	.mz-quadrant,
	.mz-direction {
		fill: var(--mz-color-muted);
		font-family: var(--mz-font-body);
		font-style: italic;
		paint-order: stroke;
		stroke: var(--mz-color-bg);
		stroke-width: 3px;
		stroke-linejoin: round;
	}
</style>
