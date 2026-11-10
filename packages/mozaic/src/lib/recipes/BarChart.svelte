<!--
@component
Recipe: a sorted horizontal bar chart with value labels, hover tooltip and
the full frame. Use it as is, or run `mozaic eject BarChart` to copy this
file into your project and change anything.
-->
<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import { scaleBand, scaleLinear } from 'd3-scale';
	import { max, min } from 'd3-array';
	import { Chart, Header, Title, Subtitle, Footer, Source, Notes, type SourceItem } from '../frame/index.js';
	import type { ChartEmbed } from '../embed/index.js';
	import { Plot, Svg, Html, estimateTextWidth, useTextWidth, scaled, type PlotContext } from '../core/index.js';
	import { Bars, Rules, Text } from '../marks/index.js';
	import { AxisY } from '../guides/index.js';
	import { Tooltip } from '../interactive/index.js';
	import { createLocale, type LocaleCode } from '../locale/index.js';
	import { base, type Medium, type Theme } from '../styles/index.js';

	interface Props {
		data: T[];
		label: (d: T) => string;
		value: (d: T) => number;
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
		/** Value label format; defaults to locale numbers. */
		format?: (n: number) => string;
		/** Bar colour; defaults to the first categorical colour. */
		color?: (d: T) => string;
		/** Sort largest first (default) or keep data order. */
		sort?: boolean;
		rowHeight?: number;
		/** Extra SVG drawn on top of the bars (annotations); receives the plot context. */
		annotations?: Snippet<[PlotContext]>;
	}

	let {
		data,
		label,
		value,
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
		color,
		sort = true,
		rowHeight = 28,
		annotations
	}: Props = $props();

	const theme = $derived(style);
	const measure = useTextWidth();
	/** Width of a row label in the axis font, measured once mounted. */
	const labelWidth = (s: string) => measure(s, theme.plot.fontSize, theme.tokens['--mz-font-body']);
	const fmt = $derived(format ?? createLocale(locale ?? theme.defaultLocale).number);
	const rows = $derived(sort ? data.toSorted((a, b) => value(b) - value(a)) : data);
	const x = $derived(
		scaleLinear()
			.domain([Math.min(0, min(rows, value) ?? 0), Math.max(0, max(rows, value) ?? 1)])
			.nice()
	);
	const y = $derived(scaleBand<string>().domain(rows.map(label)).paddingInner(0.25).paddingOuter(0.1));
	const left = $derived(Math.max(...rows.map((d) => labelWidth(label(d))), 0) + 12);
	const right = $derived(Math.max(...rows.map((d) => estimateTextWidth(fmt(value(d)), theme.plot.fontSize)), 0) + 12);
	let hovered = $state<T | null>(null);
</script>

<Chart {style} {locale} {medium} {width} {alt} {embed}>
	{#if title || subtitle}
		<Header>
			{#if title}<Title>{title}</Title>{/if}
			{#if subtitle}<Subtitle>{subtitle}</Subtitle>{/if}
		</Header>
	{/if}

	<Plot {x} {y} height={rows.length * rowHeight} padding={{ left, right, top: 0, bottom: 0 }}>
		{#snippet children(plot)}
			<Svg>
				<AxisY />
				<Bars
					data={rows}
					x={value}
					y={label}
					fill={color}
					opacity={(d) => (hovered && hovered !== d ? 0.5 : 1)}
					onpointerenter={(d) => (hovered = d)}
					onpointerleave={() => (hovered = null)}
				/>
				<Rules x={[0]} />
				<Text data={rows} x={value} y={label} text={(d) => fmt(value(d))} dx={4} />
				{@render annotations?.(plot)}
			</Svg>
			<Html>
				{#if hovered}
					<Tooltip x={plot.x(value(hovered)) ?? 0} y={scaled(plot.y, label(hovered))}>
						<strong>{label(hovered)}</strong><br />{fmt(value(hovered))}
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
