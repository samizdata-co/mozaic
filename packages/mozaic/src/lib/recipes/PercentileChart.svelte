<!--
@component
Recipe: "how do you compare?". One strip per group showing its published
percentiles (a line across the range, a thicker band for the middle half, a
dot per percentile and a large dot for the median), a "you" line at the
reader's value, and the reader's estimated percentile in each group at the
right. Readers set the value with a number box, a slider, or by clicking or
dragging on the strips. Percentiles are interpolated linearly between the
published points (see `percentileRank` in `@samizdata/mozaic/transforms`).
In print the controls are hidden and the chart shows the starting value.
Use it as is, or run `mozaic eject PercentileChart` to copy this file into
your project and change anything.
-->
<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import { scaleBand, scaleLinear } from 'd3-scale';
	import { max, min } from 'd3-array';
	import { Chart, Header, Title, Subtitle, Footer, Source, Notes } from '../frame/index.js';
	import type { ChartEmbed } from '../embed/index.js';
	import { Plot, Svg, estimateTextWidth, type PlotContext } from '../core/index.js';
	import { AxisX, GridX, Legend } from '../guides/index.js';
	import { PointerArea } from '../interactive/index.js';
	import { percentileRank, type PercentileRank } from '../transforms/index.js';
	import { createLocale, type LocaleCode } from '../locale/index.js';
	import { base, type Medium, type Theme } from '../styles/index.js';

	type Maybe = number | null | undefined;

	interface Props {
		/** One row per group (an occupation, a region, …). */
		data: T[];
		/** Group name, written above its strip. */
		label: (d: T) => string;
		/** The group's published percentiles: `p` from 0 to 100 (50 is the median). Missing values are skipped. */
		percentiles: (d: T) => { p: number; value: Maybe }[];
		/** The reader's value. Bindable; defaults to the median of the first highlighted group (or the first group). */
		value?: number;
		/** Groups to emphasise: highlight colour, bold name, and the group `summary` describes. */
		highlight?: (d: T) => boolean;
		/** Label of the number box (e.g. "Your salary"). Also its accessible name. */
		inputLabel?: string;
		/** Text before and after the number box (e.g. "£", "a year"). */
		inputPrefix?: string;
		inputSuffix?: string;
		/** Slider step and rounding for clicks on the plot; defaults to a round step of about 1% of the range. */
		step?: number;
		/** Slider range; defaults to the x domain. */
		min?: number;
		max?: number;
		/** Label of the "you" line. Defaults to the formatted value; a function gets the formatted value. */
		youLabel?: string | ((formatted: string) => string);
		/** Heading over the right-hand column of percentiles (e.g. "You earn more than"). */
		readoutLabel?: string;
		/** Text in the right-hand column; defaults to "65%", "<10%" or ">90%". */
		readout?: (rank: PercentileRank, d: T) => string;
		/** A sentence under the controls about the first highlighted group (e.g. "You earn more than 65% of housing officers"). Announced to screen readers as it changes. */
		summary?: (rank: PercentileRank, d: T, value: number) => string;
		/** Legend names for the median dot, the middle half (p25–p75) and the full published range. A legend is shown only for the names given. */
		medianLabel?: string;
		middleLabel?: string;
		rangeLabel?: string;
		/** Name of a percentile in dot tooltips; defaults to "P25". */
		percentileLabel?: (p: number) => string;
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
		/** Value format (labels, tooltips); defaults to locale numbers. */
		format?: (n: number) => string;
		/** Axis tick format; defaults to `format`. */
		tickFormat?: (n: number) => string;
		/** Strip colour; defaults to the highlight colour for highlighted groups and the neutral grey for the rest. */
		color?: (d: T) => string;
		/** x domain; defaults to the lowest and highest published values, rounded. */
		domain?: [number, number];
		/** Height of each row (name and strip), px. */
		rowHeight?: number;
		/** Extra SVG drawn on top (annotations); receives the plot context. */
		annotations?: Snippet<[PlotContext]>;
	}

	let {
		data,
		label,
		percentiles,
		value = $bindable(),
		highlight,
		inputLabel,
		inputPrefix,
		inputSuffix,
		step,
		min: minValue,
		max: maxValue,
		youLabel,
		readoutLabel,
		readout,
		summary,
		medianLabel,
		middleLabel,
		rangeLabel,
		percentileLabel = (p: number) => `P${p}`,
		style = base,
		locale,
		medium = 'web',
		width,
		title,
		subtitle,
		notes,
		source,
		alt,
		embed,
		format,
		tickFormat,
		color,
		domain,
		rowHeight = 52,
		annotations
	}: Props = $props();

	const has = (v: Maybe): v is number => v !== null && v !== undefined && Number.isFinite(v);
	const theme = $derived(style);
	const numbers = $derived(createLocale(locale ?? theme.defaultLocale));
	const fmt = $derived(format ?? numbers.number);
	const fontSize = $derived(theme.plot.fontSize);
	const uid = $props.id();

	/** Each group with its usable points, sorted by percentile. */
	const groups = $derived(
		data.map((d) => {
			const points = percentiles(d)
				.filter((q): q is { p: number; value: number } => has(q.value))
				.toSorted((a, b) => a.p - b.p);
			const at = (p: number) => points.find((q) => q.p === p)?.value;
			return { d, name: label(d), points, median: at(50), q1: at(25), q3: at(75), on: highlight?.(d) ?? false };
		})
	);
	const values = $derived(groups.flatMap((g) => g.points.map((q) => q.value)));
	const x = $derived(
		scaleLinear()
			.domain(domain ?? [min(values) ?? 0, max(values) ?? 1])
			.nice()
	);
	const lo = $derived(minValue ?? x.domain()[0]);
	const hi = $derived(maxValue ?? x.domain()[1]);
	const roundStep = $derived(step ?? 10 ** Math.floor(Math.log10(Math.max(hi - lo, 1e-9) / 100)));

	const primary = $derived(groups.find((g) => g.on) ?? groups[0]);
	const fallback = $derived(primary?.median ?? primary?.points[Math.floor(primary.points.length / 2)]?.value ?? lo);
	const current = $derived(has(value) ? value : fallback);
	const clamp = (v: number) => Math.min(hi, Math.max(lo, v));
	function set(v: number) {
		if (Number.isFinite(v)) value = v;
	}

	const ranks = $derived(groups.map((g) => percentileRank(current, g.points)));
	const percent = $derived(numbers.format('.0f'));
	const readoutText = (rank: PercentileRank | undefined, d: T) => {
		if (!rank) return '–';
		if (readout) return readout(rank, d);
		const n = percent(rank.percentile);
		return rank.below ? `<${n}%` : rank.above ? `>${n}%` : `${n}%`;
	};
	const readouts = $derived(groups.map((g, i) => readoutText(ranks[i], g.d)));
	const summaryText = $derived.by(() => {
		if (!summary || !primary) return '';
		const rank = ranks[groups.indexOf(primary)];
		return rank ? summary(rank, primary.d, current) : '';
	});
	const you = $derived(typeof youLabel === 'function' ? youLabel(fmt(current)) : (youLabel ?? fmt(current)));

	const stripColor = $derived(
		(g: (typeof groups)[number]) =>
			color?.(g.d) ?? (g.on ? theme.palettes.semantic.highlight : theme.palettes.semantic.neutral)
	);
	const legendColor = $derived(primary ? stripColor(primary) : theme.palettes.semantic.highlight);

	/** The right-hand column fits the readouts; its heading wraps to the column, above the plot. */
	const headingSize = $derived(fontSize * 0.9);
	const column = $derived(
		Math.max(
			...readouts.map((t) => estimateTextWidth(t, fontSize)),
			...(readoutLabel ?? '').split(/\s+/).map((w) => estimateTextWidth(w, headingSize)),
			readoutLabel ? Math.min(estimateTextWidth(readoutLabel, headingSize), 64) : 0,
			0
		)
	);
	const right = $derived(column + 14);
	const headingLines = $derived.by(() => {
		const lines: string[] = [];
		for (const word of (readoutLabel ?? '').split(/\s+/).filter(Boolean)) {
			const last = lines.at(-1);
			if (last !== undefined && estimateTextWidth(`${last} ${word}`, headingSize) <= column)
				lines[lines.length - 1] = `${last} ${word}`;
			else lines.push(word);
		}
		return lines;
	});
	const lineHeight = $derived(Math.round(headingSize * 1.2));
	const top = $derived(20 + Math.max(0, headingLines.length - 1) * lineHeight);
	const y = $derived(scaleBand<string>().domain(groups.map((g) => g.name)));
	/** Baselines inside a row: the name, then the strip under it. */
	const nameY = $derived(fontSize + 2);
	const stripY = $derived(Math.max(nameY + 18, rowHeight * 0.66));

	function fromPointer(plot: PlotContext, px: number, event: PointerEvent) {
		if (event.type !== 'pointerdown' && event.buttons === 0) return;
		const raw = plot.x.invert?.(px);
		if (typeof raw === 'number') set(clamp(Math.round(raw / roundStep) * roundStep));
	}
</script>

<Chart {style} {locale} {medium} {width} {alt} {embed}>
	<Header>
		{#if title}<Title>{title}</Title>{/if}
		{#if subtitle}<Subtitle>{subtitle}</Subtitle>{/if}
		{#if medium !== 'print'}
			<div class="mz-percentile-controls">
				<label class="mz-percentile-input" for="{uid}-value">
					{#if inputLabel}<span class="mz-percentile-input-label">{inputLabel}</span>{/if}
					<span class="mz-percentile-field">
						{#if inputPrefix}<span aria-hidden="true">{inputPrefix}</span>{/if}
						<input
							id="{uid}-value"
							type="number"
							inputmode="decimal"
							min={lo}
							max={hi}
							step="any"
							value={current}
							aria-label={inputLabel ? undefined : you}
							oninput={(e) => set(e.currentTarget.valueAsNumber)}
						/>
						{#if inputSuffix}<span aria-hidden="true">{inputSuffix}</span>{/if}
					</span>
				</label>
				<input
					class="mz-percentile-slider"
					type="range"
					min={lo}
					max={hi}
					step={roundStep}
					value={clamp(current)}
					aria-label={inputLabel ?? you}
					aria-valuetext={fmt(current)}
					oninput={(e) => set(e.currentTarget.valueAsNumber)}
				/>
			</div>
		{/if}
		{#if summaryText}<p class="mz-percentile-summary" aria-live="polite">{summaryText}</p>{/if}
		{#if medianLabel || middleLabel || rangeLabel}
			<div class="mz-percentile-legend">
				{#if medianLabel}<Legend shape="circle" items={[{ label: medianLabel, color: legendColor }]} />{/if}
				{#if middleLabel}<Legend items={[{ label: middleLabel, color: legendColor }]} />{/if}
				{#if rangeLabel}<Legend shape="line" items={[{ label: rangeLabel, color: legendColor }]} />{/if}
			</div>
		{/if}
	</Header>

	<Plot {x} {y} height={groups.length * rowHeight} padding={{ left: 4, right, top, bottom: 24 }}>
		{#snippet children(plot)}
			{@const yx = clamp(current)}
			{@const px = plot.x(Math.min(x.domain()[1], Math.max(x.domain()[0], yx))) ?? 0}
			{@const anchor = px > plot.width * 0.8 ? 'end' : px < plot.width * 0.2 ? 'start' : 'middle'}
			<Svg>
				<GridX ticks={4} />
				<AxisX ticks={4} format={tickFormat ?? fmt} />
				<PointerArea onmove={({ x: p, event }) => fromPointer(plot, p, event)} />
				<!-- Above the plot, in the right-hand column (clear of the "you" label, which stays over the plot area). -->
				{#each headingLines as line, i (i)}
					<text
						class="mz-percentile-heading"
						x={plot.width + right}
						y={-8 - (headingLines.length - 1 - i) * lineHeight}
						text-anchor="end">{line}</text
					>
				{/each}
				<!-- Under the rows, so group names (with a background halo) and dots sit on top of it. -->
				<line class="mz-percentile-you" x1={px} x2={px} y1={-4} y2={plot.height} />
				{#each groups as g, i (g.name)}
					{@const rowTop = plot.y(g.name) ?? 0}
					{@const c = stripColor(g)}
					{@const first = g.points[0]}
					{@const last = g.points[g.points.length - 1]}
					<g class="mz-percentile-row" class:on={g.on} transform="translate(0,{rowTop})">
						<text class="mz-percentile-name" y={nameY}>{g.name}</text>
						{#if first && last}
							<line
								x1={plot.x(first.value)}
								x2={plot.x(last.value)}
								y1={stripY}
								y2={stripY}
								stroke={c}
								stroke-width="2"
								stroke-opacity="0.5"
							/>
						{/if}
						{#if has(g.q1) && has(g.q3)}
							<line
								x1={plot.x(g.q1)}
								x2={plot.x(g.q3)}
								y1={stripY}
								y2={stripY}
								stroke={c}
								stroke-width="10"
								stroke-opacity="0.35"
							/>
						{/if}
						{#each g.points.filter((q) => q.p !== 50) as q (q.p)}
							<circle cx={plot.x(q.value)} cy={stripY} r="3" fill={c}>
								<title>{g.name}, {percentileLabel(q.p)}: {fmt(q.value)}</title>
							</circle>
						{/each}
						{#if has(g.median)}
							<circle
								cx={plot.x(g.median)}
								cy={stripY}
								r="6.5"
								fill={c}
								stroke={theme.tokens['--mz-color-bg']}
								stroke-width="1.5"
							>
								<title>{g.name}, {medianLabel ?? percentileLabel(50)}: {fmt(g.median)}</title>
							</circle>
						{/if}
						<text class="mz-percentile-readout" x={plot.width + right} y={stripY} dy="0.35em" text-anchor="end"
							>{readouts[i]}</text
						>
					</g>
				{/each}
				<text class="mz-percentile-you-label" x={px} y={-8} text-anchor={anchor}>{you}</text>
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
	.mz-percentile-controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 1rem;
		font-family: var(--mz-font-label);
		font-size: var(--mz-size-small);
	}
	.mz-percentile-input {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--mz-color-text);
	}
	.mz-percentile-input-label {
		font-weight: var(--mz-weight-label);
		text-transform: var(--mz-label-transform);
		letter-spacing: var(--mz-label-tracking);
	}
	.mz-percentile-field {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.2rem 0.5rem;
		border: 1px solid var(--mz-color-axis);
		border-radius: var(--mz-radius);
		background: var(--mz-color-bg);
	}
	.mz-percentile-field:focus-within {
		outline: 2px solid var(--mz-color-accent);
		outline-offset: 1px;
	}
	.mz-percentile-field input {
		width: 7ch;
		border: 0;
		padding: 0;
		background: transparent;
		color: var(--mz-color-text);
		font: inherit;
		font-size: var(--mz-size-body);
		font-weight: var(--mz-weight-strong);
		font-variant-numeric: tabular-nums;
		outline: none;
		appearance: textfield;
		-moz-appearance: textfield;
	}
	.mz-percentile-field input::-webkit-inner-spin-button,
	.mz-percentile-field input::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	.mz-percentile-slider {
		flex: 1 1 10rem;
		min-width: 8rem;
		max-width: 22rem;
		accent-color: var(--mz-color-accent);
	}
	.mz-percentile-summary {
		margin: 0;
		font-family: var(--mz-font-body);
		font-size: var(--mz-size-body);
		color: var(--mz-color-text);
	}
	.mz-percentile-legend {
		display: flex;
		flex-wrap: wrap;
		gap: 0 1rem;
	}
	.mz-percentile-name,
	.mz-percentile-readout,
	.mz-percentile-heading,
	.mz-percentile-you-label {
		font-family: var(--mz-font-body);
		font-size: var(--mz-size-axis);
		fill: var(--mz-color-text);
	}
	.on .mz-percentile-name,
	.mz-percentile-readout,
	.mz-percentile-you-label {
		font-weight: var(--mz-weight-strong);
	}
	/* A background-coloured outline keeps names legible where the "you" line crosses them. */
	.mz-percentile-name {
		paint-order: stroke;
		stroke: var(--mz-color-bg);
		stroke-width: 4px;
		stroke-linejoin: round;
	}
	.mz-percentile-readout {
		font-variant-numeric: tabular-nums;
	}
	.mz-percentile-heading {
		fill: var(--mz-color-muted);
		font-size: calc(var(--mz-size-axis) * 0.9);
	}
	.mz-percentile-you {
		stroke: var(--mz-color-text);
		stroke-width: 1.5;
		pointer-events: none;
	}
</style>
