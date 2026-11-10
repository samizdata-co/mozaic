<script lang="ts">
	import { scaleLinear, scaleTime } from 'd3-scale';
	import { bisector, extent, max, min } from 'd3-array';
	import { curveMonotoneX } from 'd3-shape';
	import { Chart, Header, Title, Subtitle, Footer, Source, Notes } from '@samizdata/mozaic/frame';
	import { Plot, Svg, Html } from '@samizdata/mozaic/core';
	import { Line, LineEndLabels } from '@samizdata/mozaic/marks';
	import { AxisX, AxisY, GridY, Legend } from '@samizdata/mozaic/guides';
	import { PointerArea, Tooltip } from '@samizdata/mozaic/interactive';
	import { createLocale } from '@samizdata/mozaic/locale';
	import type { ExampleProps } from '../types';
	import { messages, series, type Point } from './data';

	let { style, locale, medium = 'web', width }: ExampleProps = $props();

	const t = $derived(messages[locale]);
	const fmt = $derived(createLocale(locale));
	const theme = $derived(style);

	// Colour follows the entity: each region keeps its slot whatever is shown.
	const color = $derived(Object.fromEntries(series.map((s, i) => [s.id, theme.palettes.categorical[i]])));
	const name = (id: string) => t.regions[id];

	const allPoints = series.flatMap((s) => s.values);
	const dates = series[0].values.map((p) => p.date);
	const x = scaleTime().domain(extent(dates) as [Date, Date]);
	const y = scaleLinear()
		.domain([min(allPoints, (p) => p.value) ?? 0, max(allPoints, (p) => p.value) ?? 100])
		.nice();

	const ends = series.map((s) => ({ id: s.id, ...s.values[s.values.length - 1] }));

	// Hover: index of the month nearest the pointer.
	let hoverIndex = $state<number | null>(null);
	const nearest = bisector<Date, Date>((d) => d).center;
	const monthFormat = $derived(fmt.timeFormat('%B %Y'));
</script>

<Chart {style} {locale} {medium} {width} alt={t.alt}>
	<Header>
		<Title>{t.title}</Title>
		<Subtitle>{t.subtitle}</Subtitle>
		<Legend shape="line" items={series.map((s) => ({ label: name(s.id), color: color[s.id] }))} />
	</Header>

	<Plot
		{x}
		{y}
		height={({ breakpoint }) => (breakpoint === 's' ? 260 : 340)}
		padding={({ breakpoint }) => ({ left: breakpoint === 's' ? 0 : 36, right: 76, top: 16, bottom: 28 })}
	>
		{#snippet children(plot)}
			{@const inside = plot.breakpoint === 's'}
			{@const hoverDate = hoverIndex === null ? null : dates[hoverIndex]}
			<Svg>
				<GridY ticks={5} />
				<AxisY ticks={5} {inside} />
				<AxisX ticks={plot.breakpoint === 's' ? 4 : 7} />
				{#if hoverDate}
					<line class="crosshair" x1={plot.x(hoverDate)} x2={plot.x(hoverDate)} y2={plot.height} />
				{/if}
				{#each series as s (s.id)}
					<Line
						data={s.values}
						x={(p: Point) => p.date}
						y={(p: Point) => p.value}
						stroke={color[s.id]}
						curve={curveMonotoneX}
					/>
				{/each}
				<LineEndLabels
					data={ends}
					x={(d) => d.date}
					y={(d) => d.value}
					text={(d) => name(d.id)}
					color={(d) => color[d.id]}
					colorText
				/>
				{#if hoverIndex !== null && hoverDate}
					{#each series as s (s.id)}
						<circle
							class="hover-dot"
							cx={plot.x(hoverDate)}
							cy={plot.y(s.values[hoverIndex].value)}
							r={4}
							fill={color[s.id]}
						/>
					{/each}
				{/if}
				<PointerArea
					onmove={({ x: px }) => (hoverIndex = nearest(dates, plot.x.invert?.(px)))}
					onleave={() => (hoverIndex = null)}
				/>
			</Svg>
			<Html>
				{#if hoverIndex !== null && hoverDate}
					{@const index = hoverIndex}
					<Tooltip x={plot.x(hoverDate) ?? 0} y={plot.height / 2}>
						<div class="tip-date">{monthFormat(hoverDate)}</div>
						{#each series.toSorted((a, b) => b.values[index].value - a.values[index].value) as s (s.id)}
							<div class="tip-row">
								<span class="tip-key" style:background={color[s.id]}></span>
								<span>{name(s.id)}</span>
								<strong>{fmt.format(',.1f')(s.values[index].value)}</strong>
							</div>
						{/each}
					</Tooltip>
				{/if}
			</Html>
		{/snippet}
	</Plot>

	<Footer>
		<Notes>{t.notes}</Notes>
		<Source>{t.source}</Source>
	</Footer>
</Chart>

<style>
	.crosshair {
		stroke: var(--mz-color-axis);
		stroke-width: 1;
		shape-rendering: crispEdges;
	}
	.hover-dot {
		stroke: var(--mz-color-bg);
		stroke-width: 2;
		pointer-events: none;
	}
	.tip-date {
		margin-bottom: 0.25rem;
		font-weight: 600;
	}
	.tip-row {
		display: grid;
		grid-template-columns: 0.75rem 1fr auto;
		align-items: center;
		gap: 0.375rem;
	}
	.tip-key {
		width: 0.75rem;
		height: 2px;
		border-radius: 1px;
	}
</style>
