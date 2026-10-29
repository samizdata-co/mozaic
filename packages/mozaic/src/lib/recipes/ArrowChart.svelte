<!--
@component
Recipe: an arrow plot. One row per category, with an arrow from its value at
one date to its value at a later date, the later value written beside the
arrowhead and the two dates labelled above the first arrow. Rows with only
one of the two values get a dot (hollow for the start, filled for the end).
Use it as is, or run `mozaic eject ArrowChart` to copy this file into your
project and change anything.
-->
<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import { scaleBand, scaleLinear } from 'd3-scale';
	import { max, min } from 'd3-array';
	import { Chart, Header, Title, Subtitle, Footer, Source, Notes } from '../frame/index.js';
	import { Plot, Svg, estimateTextWidth, scaled, type PlotContext } from '../core/index.js';
	import { Arrows } from '../marks/index.js';
	import { AxisX, AxisY, GridX } from '../guides/index.js';
	import { createLocale, type LocaleCode } from '../locale/index.js';
	import { resolveStyle, type StyleName, type Medium } from '../styles/index.js';

	type Maybe = number | null | undefined;

	interface Props {
		data: T[];
		label: (d: T) => string;
		/** Value at the earlier date (the arrow's tail). Missing values leave a single dot. */
		start: (d: T) => Maybe;
		/** Value at the later date (the arrowhead). */
		end: (d: T) => Maybe;
		/** Names of the two dates, shown above the first complete arrow (e.g. "2013" and "2023"). */
		startLabel?: string;
		endLabel?: string;
		style?: StyleName;
		locale?: LocaleCode;
		medium?: Medium;
		width?: number;
		title?: string;
		subtitle?: string;
		notes?: string;
		source?: string;
		alt?: string;
		/** Value label format; defaults to locale numbers. */
		format?: (n: number) => string;
		/** Axis tick format; defaults to `format`. */
		tickFormat?: (n: number) => string;
		/** Arrow colour; defaults to the first categorical colour. Grey out rows to highlight others. */
		color?: (d: T) => string;
		/** Values written beside the arrows: the end value (default), both ends, or none. */
		values?: 'end' | 'both' | 'none';
		/** Row order: as given (default), or by end value, start value or difference, largest first. */
		sort?: 'none' | 'end' | 'start' | 'difference';
		/** x domain; defaults to zero and the largest value, rounded. */
		domain?: [number, number];
		rowHeight?: number;
		/** Extra SVG drawn on top of the arrows (annotations); receives the plot context. */
		annotations?: Snippet<[PlotContext]>;
	}

	let {
		data,
		label,
		start,
		end,
		startLabel,
		endLabel,
		style = 'base',
		locale,
		medium,
		width,
		title,
		subtitle,
		notes,
		source,
		alt,
		format,
		tickFormat,
		color,
		values = 'end',
		sort = 'none',
		domain,
		rowHeight = 32,
		annotations
	}: Props = $props();

	const theme = $derived(resolveStyle(style));
	const fmt = $derived(format ?? createLocale(locale ?? theme.defaultLocale).number);
	const fontSize = $derived(theme.plot.fontSize);
	const has = (v: Maybe): v is number => v !== null && v !== undefined && Number.isFinite(v);
	const colorOf = $derived((d: T) => color?.(d) ?? theme.palettes.categorical[0]);

	const rows = $derived.by(() => {
		const key = {
			none: undefined,
			end: (d: T) => end(d) ?? -Infinity,
			start: (d: T) => start(d) ?? -Infinity,
			difference: (d: T) => (has(end(d)) && has(start(d)) ? end(d)! - start(d)! : -Infinity)
		}[sort];
		return key ? data.toSorted((a, b) => key(b) - key(a)) : data;
	});
	const both = $derived(rows.filter((d) => has(start(d)) && has(end(d))));
	const all = $derived(rows.flatMap((d) => [start(d), end(d)]).filter(has));
	const x = $derived(
		scaleLinear()
			.domain(domain ?? [Math.min(0, min(all) ?? 0), Math.max(0, max(all) ?? 1)])
			.nice()
	);
	const y = $derived(scaleBand<string>().domain(rows.map(label)).paddingInner(0.25).paddingOuter(0.1));
	const textWidth = (s: string) => estimateTextWidth(s, fontSize);
	const left = $derived(Math.max(...rows.map((d) => textWidth(label(d))), 0) + 12);
	const right = $derived(Math.max(...all.map((v) => textWidth(fmt(v))), 0) + 12);
	const labelled = $derived(Boolean(startLabel || endLabel) && both.length > 0);

	/** A value beside one end of an arrow, on the side away from the other end; flipped if it would leave the plot. */
	function valueLabel(plot: PlotContext, at: number, other: number | undefined, text: string) {
		const px = plot.x(at) ?? 0;
		const ox = other === undefined ? px - 1 : (plot.x(other) ?? 0);
		const outward = px >= ox ? 1 : -1;
		const gap = 6 + (other === undefined ? 4 : 0);
		const w = textWidth(text);
		const fits = outward > 0 || px - gap - w >= 0;
		const side = fits ? outward : 1;
		const x0 = side > 0 ? Math.max(px, ox) + gap : px - gap;
		return { x: x0, anchor: side > 0 ? 'start' : 'end', text };
	}

	/** The two date labels above the first arrow: centred on each end, or pushed apart when they would touch. */
	function dateLabels(plot: PlotContext) {
		const d = both[0];
		const sx = plot.x(start(d)!) ?? 0;
		const ex = plot.x(end(d)!) ?? 0;
		const ws = textWidth(startLabel ?? '');
		const we = textWidth(endLabel ?? '');
		const apart = Math.abs(ex - sx) >= (ws + we) / 2 + 8;
		const dir = ex >= sx ? 1 : -1;
		return {
			y: scaled(plot.y, label(d)) - plot.y.bandwidth!() / 2 - 4,
			start: { x: sx, anchor: apart ? 'middle' : dir > 0 ? 'end' : 'start' },
			end: { x: ex, anchor: apart ? 'middle' : dir > 0 ? 'start' : 'end' }
		};
	}
</script>

<Chart {style} {locale} {medium} {width} {alt}>
	{#if title || subtitle}
		<Header>
			{#if title}<Title>{title}</Title>{/if}
			{#if subtitle}<Subtitle>{subtitle}</Subtitle>{/if}
		</Header>
	{/if}

	<Plot
		{x}
		{y}
		height={rows.length * rowHeight}
		padding={{ left, right, top: labelled ? fontSize + 6 : 0, bottom: 24 }}
	>
		{#snippet children(plot)}
			<Svg>
				<GridX ticks={4} />
				<AxisX ticks={4} format={tickFormat ?? fmt} />
				<AxisY />
				<Arrows
					data={both}
					y={label}
					x1={(d) => start(d)!}
					x2={(d) => end(d)!}
					stroke={colorOf}
					title={(d) => `${label(d)}: ${fmt(start(d)!)} → ${fmt(end(d)!)}`}
				/>
				{#each rows as d (label(d))}
					{@const s = start(d)}
					{@const e = end(d)}
					{@const cy = scaled(plot.y, label(d))}
					{#if has(s) && !has(e)}
						<circle class="mz-arrow-dot-start" cx={plot.x(s)} {cy} r={4} stroke={colorOf(d)}>
							<title>{label(d)}: {fmt(s)}</title>
						</circle>
					{:else if has(e) && !has(s)}
						<circle class="mz-arrow-dot-end" cx={plot.x(e)} {cy} r={4} fill={colorOf(d)}>
							<title>{label(d)}: {fmt(e)}</title>
						</circle>
					{/if}
					{#if values !== 'none'}
						{#if has(e)}
							{@const v = valueLabel(plot, e, has(s) ? s : undefined, fmt(e))}
							<text class="mz-arrow-value strong" x={v.x} y={cy} dy="0.35em" text-anchor={v.anchor}>{v.text}</text>
						{:else if has(s)}
							{@const v = valueLabel(plot, s, undefined, fmt(s))}
							<text class="mz-arrow-value earlier" x={v.x} y={cy} dy="0.35em" text-anchor={v.anchor}>{v.text}</text>
						{/if}
						{#if values === 'both' && has(s) && has(e)}
							{@const v = valueLabel(plot, s, e, fmt(s))}
							<text class="mz-arrow-value" x={v.x} y={cy} dy="0.35em" text-anchor={v.anchor}>{v.text}</text>
						{/if}
					{/if}
				{/each}
				{#if labelled}
					{@const l = dateLabels(plot)}
					{#if startLabel}
						<text class="mz-arrow-date" x={l.start.x} y={l.y} text-anchor={l.start.anchor}>{startLabel}</text>
					{/if}
					{#if endLabel}
						<text class="mz-arrow-date strong" x={l.end.x} y={l.y} text-anchor={l.end.anchor}>{endLabel}</text>
					{/if}
				{/if}
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
	.mz-arrow-value,
	.mz-arrow-date {
		font-family: var(--mz-font-body);
		font-size: var(--mz-size-axis);
		fill: var(--mz-color-text);
		font-variant-numeric: tabular-nums;
	}
	/* Date labels, and the value of a row with only the earlier date. */
	.mz-arrow-date,
	.earlier {
		fill: var(--mz-color-muted);
	}
	.strong {
		font-weight: var(--mz-weight-strong);
	}
	.mz-arrow-dot-start {
		fill: var(--mz-color-bg);
		stroke-width: 2;
	}
	.mz-arrow-dot-end {
		stroke: var(--mz-color-bg);
		stroke-width: 1.5;
	}
</style>
