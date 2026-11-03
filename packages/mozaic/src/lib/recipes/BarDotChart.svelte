<!--
@component
Recipe: horizontal bars for the latest value of each category, a dot for an
earlier value, and the latest value with its change written at the right
("29.2% −3.2"). Good for two survey waves where the latest one matters most.
Rows missing a value show only the bar or the dot. Use it as is, or run
`mozaic eject BarDotChart` to copy this file into your project and change
anything.
-->
<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import { scaleBand, scaleLinear } from 'd3-scale';
	import { max, min } from 'd3-array';
	import { Chart, Header, Title, Subtitle, Footer, Source, Notes } from '../frame/index.js';
	import type { ChartEmbed } from '../embed/index.js';
	import { Plot, Svg, estimateTextWidth, scaled, type PlotContext } from '../core/index.js';
	import { Bars, Points } from '../marks/index.js';
	import { AxisX, AxisY, GridX, Legend } from '../guides/index.js';
	import { createLocale, type LocaleCode } from '../locale/index.js';
	import { base, type Medium, type Theme } from '../styles/index.js';

	type Maybe = number | null | undefined;

	interface Props {
		data: T[];
		label: (d: T) => string;
		/** Latest value, drawn as a bar. */
		value: (d: T) => Maybe;
		/** Earlier value, drawn as a dot. */
		previous: (d: T) => Maybe;
		/** Legend names for the bars and the dots (e.g. the two fieldwork dates). */
		valueLabel?: string;
		previousLabel?: string;
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
		/** Value label format; defaults to locale numbers. */
		format?: (n: number) => string;
		/** Change label format; defaults to one decimal with a sign. */
		formatChange?: (n: number) => string;
		/** Axis tick format; defaults to `format`. */
		tickFormat?: (n: number) => string;
		/** Bar colour; defaults to a mid step of the sequential palette. Use the context grey for "don't know" rows. */
		color?: (d: T) => string;
		/** Dot colour; defaults to the darkest sequential step. */
		dotColor?: string;
		/** Sort by the latest value, largest first, or keep data order (default). */
		sort?: boolean;
		/** x domain; defaults to zero and the largest value, rounded. */
		domain?: [number, number];
		rowHeight?: number;
		/** Extra SVG drawn on top (annotations); receives the plot context. */
		annotations?: Snippet<[PlotContext]>;
	}

	let {
		data,
		label,
		value,
		previous,
		valueLabel,
		previousLabel,
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
		formatChange,
		tickFormat,
		color,
		dotColor,
		sort = false,
		domain,
		rowHeight = 32,
		annotations
	}: Props = $props();

	const theme = $derived(style);
	const numbers = $derived(createLocale(locale ?? theme.defaultLocale));
	const fmt = $derived(format ?? numbers.number);
	const signed = $derived(
		formatChange ?? ((n: number) => (Math.abs(n) < 0.05 ? numbers.format('.1f')(0) : numbers.format('+.1f')(n)))
	);
	const fontSize = $derived(theme.plot.fontSize);
	const has = (v: Maybe): v is number => v !== null && v !== undefined && Number.isFinite(v);
	const sequential = $derived(theme.palettes.sequential);
	const barColor = $derived((d: T) => color?.(d) ?? sequential[Math.floor(sequential.length / 2)]);
	const dot = $derived(dotColor ?? sequential[sequential.length - 1]);

	const rows = $derived(sort ? data.toSorted((a, b) => (value(b) ?? -Infinity) - (value(a) ?? -Infinity)) : data);
	const all = $derived(rows.flatMap((d) => [value(d), previous(d)]).filter(has));
	const x = $derived(
		scaleLinear()
			.domain(domain ?? [Math.min(0, min(all) ?? 0), Math.max(0, max(all) ?? 1)])
			.nice()
	);
	const y = $derived(scaleBand<string>().domain(rows.map(label)).padding(0.3));
	const text = (d: T) => {
		const v = value(d);
		const p = previous(d);
		return { value: has(v) ? fmt(v) : '–', change: has(v) && has(p) ? signed(v - p) : '' };
	};
	const left = $derived(Math.max(...rows.map((d) => estimateTextWidth(label(d), fontSize)), 0) + 12);
	const right = $derived(
		Math.max(
			...rows.map((d) => {
				const t = text(d);
				return estimateTextWidth(`${t.value}  ${t.change}`, fontSize);
			}),
			0
		) + 12
	);
</script>

<Chart {style} {locale} {medium} {width} {alt} {embed}>
	<Header>
		{#if title}<Title>{title}</Title>{/if}
		{#if subtitle}<Subtitle>{subtitle}</Subtitle>{/if}
		{#if valueLabel || previousLabel}
			<div class="mz-bar-dot-legend">
				{#if valueLabel}<Legend
						items={[{ label: valueLabel, color: sequential[Math.floor(sequential.length / 2)] }]}
					/>{/if}
				{#if previousLabel}<Legend shape="circle" items={[{ label: previousLabel, color: dot }]} />{/if}
			</div>
		{/if}
	</Header>

	<Plot {x} {y} height={rows.length * rowHeight} padding={{ left, right, top: 4, bottom: 24 }}>
		{#snippet children(plot)}
			<Svg>
				<GridX ticks={4} />
				<AxisX ticks={4} format={tickFormat ?? fmt} />
				<AxisY />
				<Bars
					data={rows.filter((d) => has(value(d)))}
					y={label}
					x={(d) => value(d)!}
					fill={barColor}
					title={(d) => `${label(d)}: ${fmt(value(d)!)}`}
				/>
				<Points
					data={rows.filter((d) => has(previous(d)))}
					y={label}
					x={(d) => previous(d)!}
					r={4}
					fill={dot}
					stroke={theme.tokens['--mz-color-bg']}
					strokeWidth={1.5}
					title={(d) => `${label(d)}${previousLabel ? `, ${previousLabel}` : ''}: ${fmt(previous(d)!)}`}
				/>
				{#each rows as d (label(d))}
					{@const t = text(d)}
					<text class="mz-bar-dot-value" x={plot.width + 8} y={scaled(plot.y, label(d))} dy="0.35em">
						<tspan class="strong">{t.value}</tspan>
						{#if t.change}<tspan class="change" dx="6">{t.change}</tspan>{/if}
					</text>
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
	.mz-bar-dot-legend {
		display: flex;
		flex-wrap: wrap;
		gap: 0 1rem;
	}
	.mz-bar-dot-value {
		font-family: var(--mz-font-body);
		font-size: var(--mz-size-axis);
		fill: var(--mz-color-text);
		font-variant-numeric: tabular-nums;
	}
	.strong {
		font-weight: var(--mz-weight-strong);
	}
	.change {
		fill: var(--mz-color-muted);
	}
</style>
