<!--
@component
Recipe: a vertical column chart (one series), e.g. a value per year, with
gridlines, hover tooltip and the full frame. `mozaic eject ColumnChart`
copies this file into your project.
-->
<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import { scaleBand, scaleLinear } from 'd3-scale';
	import { max, min } from 'd3-array';
	import { Chart, Header, Title, Subtitle, Footer, Source, Notes } from '../frame/index.js';
	import type { ChartEmbed } from '../embed/index.js';
	import { Plot, Svg, Html, scaled, type PlotContext } from '../core/index.js';
	import { Bars, Rules } from '../marks/index.js';
	import { AxisX, AxisY, GridY } from '../guides/index.js';
	import { Tooltip } from '../interactive/index.js';
	import { createLocale, type LocaleCode } from '../locale/index.js';
	import { resolveStyle, type StyleName, type Medium } from '../styles/index.js';

	interface Props {
		data: T[];
		/** Category on the x axis (e.g. the year). */
		label: (d: T) => string;
		value: (d: T) => number;
		style?: StyleName;
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
		color?: (d: T) => string;
		height?: number;
		/** Show every nth x label (useful for long series). */
		labelEvery?: number;
		annotations?: Snippet<[PlotContext]>;
	}

	let {
		data,
		label,
		value,
		style = 'base',
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
		height = 280,
		labelEvery,
		annotations
	}: Props = $props();

	const theme = $derived(resolveStyle(style));
	const fmt = $derived(format ?? createLocale(locale ?? theme.defaultLocale).number);
	const x = $derived(scaleBand<string>().domain(data.map(label)).paddingInner(0.2).paddingOuter(0.1));
	const y = $derived(
		scaleLinear()
			.domain([Math.min(0, min(data, value) ?? 0), Math.max(0, max(data, value) ?? 1)])
			.nice()
	);
	let hovered = $state<T | null>(null);
</script>

<Chart {style} {locale} {medium} {width} {alt} {embed}>
	{#if title || subtitle}
		<Header>
			{#if title}<Title>{title}</Title>{/if}
			{#if subtitle}<Subtitle>{subtitle}</Subtitle>{/if}
		</Header>
	{/if}

	<Plot {x} {y} {height} padding={{ left: 40, right: 8, top: 8, bottom: 28 }}>
		{#snippet children(plot)}
			{@const every = labelEvery ?? Math.max(1, Math.ceil((data.length * 36) / Math.max(1, plot.width)))}
			<Svg>
				<GridY ticks={5} />
				<AxisY ticks={5} format={fmt} />
				<AxisX tickValues={data.map(label).filter((_, i) => i % every === 0)} />
				<Bars
					{data}
					x={label}
					y={value}
					fill={color}
					opacity={(d) => (hovered && hovered !== d ? 0.5 : 1)}
					onpointerenter={(d) => (hovered = d)}
					onpointerleave={() => (hovered = null)}
				/>
				<Rules y={[0]} />
				{@render annotations?.(plot)}
			</Svg>
			<Html>
				{#if hovered}
					<Tooltip x={scaled(plot.x, label(hovered))} y={plot.y(value(hovered)) ?? 0}>
						<strong>{label(hovered)}</strong><br />{fmt(value(hovered))}
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
