<!--
@component
Recipe: a multi-series line chart with a legend, direct end labels and a
crosshair tooltip. Series colours follow the series order in the theme's
categorical palette. `mozaic eject LineChart` copies this file into your
project.
-->
<script lang="ts" generics="S, P">
	import type { Snippet } from 'svelte';
	import { scaleLinear, scaleTime } from 'd3-scale';
	import { bisector, extent, max, min } from 'd3-array';
	import { curveMonotoneX } from 'd3-shape';
	import { Chart, Header, Title, Subtitle, Footer, Source, Notes } from '../frame/index.js';
	import type { ChartEmbed } from '../embed/index.js';
	import { Plot, Svg, Html, type PlotContext } from '../core/index.js';
	import { Line, LineEndLabels } from '../marks/index.js';
	import { AxisX, AxisY, GridY, Legend } from '../guides/index.js';
	import { PointerArea, Tooltip } from '../interactive/index.js';
	import { createLocale, type LocaleCode } from '../locale/index.js';
	import { base, type Medium, type Theme } from '../styles/index.js';

	interface Props {
		series: S[];
		/** Points of one series, sorted by x. */
		points: (s: S) => P[];
		name: (s: S) => string;
		x: (p: P) => Date;
		y: (p: P) => number;
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
		format?: (n: number) => string;
		/** Tooltip date format (d3-time-format specifier). */
		dateFormat?: string;
		color?: (s: S, index: number) => string;
		/** Start the y axis at zero. */
		zero?: boolean;
		height?: number;
		annotations?: Snippet<[PlotContext]>;
	}

	let {
		series,
		points,
		name,
		x: xValue,
		y: yValue,
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
		dateFormat = '%B %Y',
		color,
		zero = false,
		height,
		annotations
	}: Props = $props();

	const theme = $derived(style);
	const loc = $derived(createLocale(locale ?? theme.defaultLocale));
	const fmt = $derived(format ?? loc.number);
	const colour = (s: S, i: number) =>
		color?.(s, i) ?? theme.palettes.categorical[i % theme.palettes.categorical.length];

	const all = $derived(series.flatMap(points));
	const x = $derived(scaleTime().domain(extent(all, xValue) as [Date, Date]));
	const y = $derived(
		scaleLinear()
			.domain([zero ? Math.min(0, min(all, yValue) ?? 0) : (min(all, yValue) ?? 0), max(all, yValue) ?? 1])
			.nice()
	);
	const ends = $derived(series.map((s, i) => ({ s, i, p: points(s)[points(s).length - 1] })).filter((e) => e.p));
	const dates = $derived(points(series[0] ?? ([] as unknown as S)) ?? []);
	const nearest = $derived(bisector<P, Date>(xValue).center);
	let hover = $state<P | null>(null);
	const valueAt = (s: S, date: Date) => points(s).find((p) => +xValue(p) === +date);
</script>

<Chart {style} {locale} {medium} {width} {alt} {embed}>
	<Header>
		{#if title}<Title>{title}</Title>{/if}
		{#if subtitle}<Subtitle>{subtitle}</Subtitle>{/if}
		{#if series.length > 1}
			<Legend shape="line" items={series.map((s, i) => ({ label: name(s), color: colour(s, i) }))} />
		{/if}
	</Header>

	<Plot
		{x}
		{y}
		height={height ?? (({ breakpoint }) => (breakpoint === 's' ? 260 : 340))}
		padding={({ breakpoint }) => ({ left: breakpoint === 's' ? 0 : 40, right: 80, top: 16, bottom: 28 })}
	>
		{#snippet children(plot)}
			<Svg>
				<GridY ticks={5} />
				<AxisY ticks={5} format={fmt} inside={plot.breakpoint === 's'} />
				<AxisX ticks={plot.breakpoint === 's' ? 4 : 7} />
				{#if hover}
					<line x1={plot.x(xValue(hover))} x2={plot.x(xValue(hover))} y2={plot.height} stroke="var(--mz-color-axis)" />
				{/if}
				{#each series as s, i}
					<Line data={points(s)} x={xValue} y={yValue} stroke={colour(s, i)} curve={curveMonotoneX} />
				{/each}
				<LineEndLabels
					data={ends}
					x={(e) => xValue(e.p)}
					y={(e) => yValue(e.p)}
					text={(e) => name(e.s)}
					color={(e) => colour(e.s, e.i)}
				/>
				{@render annotations?.(plot)}
				<PointerArea
					onmove={({ x: px }) => {
						const date = plot.x.invert?.(px);
						hover = date ? (dates[nearest(dates, date)] ?? null) : null;
					}}
					onleave={() => (hover = null)}
				/>
			</Svg>
			<Html>
				{#if hover}
					{@const date = xValue(hover)}
					<Tooltip x={plot.x(date) ?? 0} y={plot.height / 2}>
						<strong>{loc.timeFormat(dateFormat)(date)}</strong>
						{#each series as s, i}
							{@const p = valueAt(s, date)}
							{#if p}
								<div><span style:color={colour(s, i)}>●</span> {name(s)}: <strong>{fmt(yValue(p))}</strong></div>
							{/if}
						{/each}
					</Tooltip>
				{/if}
			</Html>
		{/snippet}
	</Plot>

	{#if notes || source}
		<Footer>
			{#if notes}<Notes>{notes}</Notes>{/if}
			{#if source}<Source>{source}</Source>{/if}
		</Footer>
	{/if}
</Chart>
