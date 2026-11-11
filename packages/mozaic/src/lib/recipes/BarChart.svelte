<!--
@component
Recipe: a sorted horizontal bar chart with value labels, hover tooltip and
the full frame. Rows known only as a range (`range`) get a solid bar to the
low end, a lighter one to the high end and a "low–high" label. Value labels
sit inside the end of each bar where they fit (in white or the text colour,
whichever reads on the bar) and just past it otherwise, and the bars run to the
largest value, so there is no empty space on the right. Pass `flag`
to put a circular flag between each label and its bar. Use it as is, or run `mozaic eject BarChart` to copy this
file into your project and change anything.
-->
<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import { scaleBand, scaleLinear } from 'd3-scale';
	import { max, min } from 'd3-array';
	import { Chart, Header, Title, Subtitle, Footer, Source, Notes, type SourceItem } from '../frame/index.js';
	import type { ChartEmbed } from '../embed/index.js';
	import { Plot, Svg, Html, estimateTextWidth, useTextWidth, scaled, type PlotContext } from '../core/index.js';
	import { Bars, Flag, Rules, Text } from '../marks/index.js';
	import { AxisY } from '../guides/index.js';
	import { Tooltip } from '../interactive/index.js';
	import { createLocale, type LocaleCode } from '../locale/index.js';
	import { base, contrastRatio, type Medium, type Theme } from '../styles/index.js';

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
		/** Value label format; defaults to locale numbers. Use the locale's `money` for prices. */
		format?: (n: number) => string;
		/** Unit after the value in the tooltip, e.g. "lei/m³" (bar charts have no value axis). */
		unit?: string;
		/** Bar colour; defaults to the first categorical colour. */
		color?: (d: T) => string;
		/**
		 * Low and high ends for rows known only as a range (several suppliers,
		 * regions or estimates). The bar is solid to the low end and lighter to
		 * the high end, and the label reads "low–high". Return `null` for rows
		 * with a single value; `value` still sets the sort order.
		 */
		range?: (d: T) => [number, number] | null | undefined;
		/** The row's flag from `@samizdata/mozaic/flags`, drawn between its label and its bar. */
		flag?: (d: T) => string | null | undefined;
		/** Put value labels inside the bars where they fit (default true); otherwise always after them. */
		labelsInside?: boolean;
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
		unit,
		color,
		range,
		flag,
		labelsInside = true,
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
	const span = (d: T) => range?.(d) ?? null;
	/** Where the solid bar ends: the value, or the low end of a range. */
	const low = (d: T) => span(d)?.[0] ?? value(d);
	/** Where the bar and its label end: the value, or the high end of a range. */
	const high = (d: T) => span(d)?.[1] ?? value(d);
	const ranged = $derived(rows.filter((d) => span(d)));
	const valueLabel = (d: T) => {
		const r = span(d);
		return r ? `${fmt(r[0])}–${fmt(r[1])}` : fmt(value(d));
	};
	// No value axis is drawn, so the scale runs exactly to the data: rounding it up would only leave space.
	const x = $derived(scaleLinear().domain([Math.min(0, min(rows, low) ?? 0), Math.max(0, max(rows, high) ?? 1)]));
	const y = $derived(scaleBand<string>().domain(rows.map(label)).paddingInner(0.25).paddingOuter(0.1));
	/** Flag radius and the room the flags take between the labels and the bars. */
	const flagR = $derived(Math.round(theme.plot.fontSize * 0.6));
	const flagGap = 4;
	const flagRoom = $derived(flag && rows.some((d) => flag(d)) ? flagR * 2 + flagGap : 0);
	const left = $derived(Math.max(...rows.map((d) => labelWidth(label(d))), 0) + 12 + flagRoom);
	const textWidth = (d: T) => estimateTextWidth(valueLabel(d), theme.plot.fontSize);
	/** Labels that fit inside their solid bar, for a plot area `w` px wide. Ranges keep theirs outside. */
	const insideFor = (w: number) => {
		const scale = x.copy().range([0, w]);
		return (d: T) => labelsInside && !span(d) && low(d) > 0 && textWidth(d) + 12 <= scale(low(d)) - scale(0);
	};
	/** Room on the right for the labels that stay outside, for a plot area `w` px wide. */
	const rightFor = (w: number) => {
		const scale = x.copy().range([0, w]);
		const inside = insideFor(w);
		return Math.max(0, ...rows.filter((d) => !inside(d)).map((d) => scale(high(d)) + 4 + textWidth(d) - w)) + 4;
	};
	// The room changes the bar lengths, which changes which labels fit: two passes settle it.
	const padding = (size: { width: number }) => {
		const w = size.width - left;
		const first = rightFor(w);
		return { left, right: Math.max(first, rightFor(w - first)), top: 0, bottom: 0 };
	};
	const barColor = (d: T) => color?.(d) ?? theme.palettes.categorical[0];
	/** White on dark bars, the text colour on light ones. */
	const inkOn = (d: T) => (contrastRatio(barColor(d), '#ffffff') >= 4.5 ? '#ffffff' : 'var(--mz-color-text)');
	// Raw, not a proxy: marks compare the hovered row with each datum by identity.
	let hovered = $state.raw<T | null>(null);
</script>

<Chart {style} {locale} {medium} {width} {alt} {embed}>
	{#if title || subtitle}
		<Header>
			{#if title}<Title>{title}</Title>{/if}
			{#if subtitle}<Subtitle>{subtitle}</Subtitle>{/if}
		</Header>
	{/if}

	<Plot {x} {y} height={rows.length * rowHeight} {padding}>
		{#snippet children(plot)}
			{@const inside = insideFor(plot.width)}
			<Svg>
				<AxisY tickPadding={flagRoom ? theme.plot.tickPadding + flagRoom : undefined} />
				{#if flagRoom}
					{#each rows as d, i (i)}
						{@const svg = flag?.(d)}
						{#if svg}
							<Flag {svg} cx={-(flagR + flagGap)} cy={scaled(plot.y, label(d))} r={flagR} />
						{/if}
					{/each}
				{/if}
				{#if ranged.length}
					<Bars
						class="mz-bars-range"
						data={ranged}
						x={high}
						y={label}
						fill={color}
						opacity={(d) => (hovered && hovered !== d ? 0.2 : 0.4)}
						onpointerenter={(d) => (hovered = d)}
						onpointerleave={() => (hovered = null)}
					/>
				{/if}
				<Bars
					data={rows}
					x={low}
					y={label}
					fill={color}
					opacity={(d) => (hovered && hovered !== d ? 0.5 : 1)}
					onpointerenter={(d) => (hovered = d)}
					onpointerleave={() => (hovered = null)}
				/>
				<Rules x={[0]} />
				<Text data={rows.filter((d) => !inside(d))} x={high} y={label} text={valueLabel} dx={4} />
				<Text
					class="mz-bar-value-inside"
					data={rows.filter(inside)}
					x={low}
					y={label}
					text={valueLabel}
					dx={-6}
					anchor="end"
					fill={inkOn}
				/>
				{@render annotations?.(plot)}
			</Svg>
			<Html>
				{#if hovered}
					<Tooltip x={plot.x(high(hovered)) ?? 0} y={scaled(plot.y, label(hovered))}>
						<strong>{label(hovered)}</strong><br />{valueLabel(hovered)}{unit ? ` ${unit}` : ''}
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
