<script lang="ts">
	import { scaleLinear, scaleTime } from 'd3-scale';
	import { bisector, extent, max } from 'd3-array';
	import { Chart, Header, Title, Subtitle, Footer, Notes, Source } from 'mozaic/frame';
	import { Plot, Svg, Html } from 'mozaic/core';
	import { Area, Line, LineEndLabels, Points } from 'mozaic/marks';
	import { AxisX, AxisY, GridY, Legend } from 'mozaic/guides';
	import { RefLine } from 'mozaic/annotations';
	import { PointerArea, Tooltip } from 'mozaic/interactive';
	import { createLocale } from 'mozaic/locale';
	import type { ExampleProps } from '../types';
	import { illustrative } from '../common';
	import { messages, partyIds, polls, series, type PartyId } from './data';

	let { style, locale, medium = 'web', width }: ExampleProps = $props();

	const t = $derived(messages[locale]);
	const fmt = $derived(createLocale(locale));
	const theme = $derived(style);
	// Colour follows the party, in palette order.
	const color = $derived(Object.fromEntries(partyIds.map((id, i) => [id, theme.palettes.categorical[i]])));

	const x = scaleTime().domain(extent(polls, (d) => d.date) as [Date, Date]);
	const y = scaleLinear()
		.domain([0, max(series.flatMap((s) => s.values.map((v) => v.hi))) ?? 50])
		.nice();
	const dots = polls.flatMap((p) => partyIds.map((id) => ({ id, date: p.date, value: p.values[id] })));
	const ends = series.map((s) => ({ id: s.id, ...s.values[s.values.length - 1] }));
	const dates = series[0].values.map((v) => v.date);
	const nearest = bisector<Date, Date>((d) => d).center;
	let hoverIndex = $state<number | null>(null);
	const name = (id: PartyId) => t.parties[id];
</script>

<Chart {style} {locale} {medium} {width} alt={t.alt}>
	<Header>
		<Title>{t.title}</Title>
		<Subtitle>{t.subtitle}</Subtitle>
		<Legend shape="line" items={partyIds.map((id) => ({ label: name(id), color: color[id] }))} />
	</Header>

	<Plot
		{x}
		{y}
		height={({ breakpoint }) => (breakpoint === 's' ? 260 : 340)}
		padding={({ breakpoint }) => ({ left: breakpoint === 's' ? 0 : 32, right: 80, top: 12, bottom: 28 })}
	>
		{#snippet children(plot)}
			{@const hoverDate = hoverIndex === null ? null : dates[hoverIndex]}
			<Svg>
				<GridY ticks={5} />
				<AxisY ticks={5} inside={plot.breakpoint === 's'} />
				<AxisX ticks={plot.breakpoint === 's' ? 4 : 7} />
				{#each series as s (s.id)}
					<Area data={s.values} x={(d) => d.date} y={(d) => d.hi} y0={(d) => d.lo} fill={color[s.id]} opacity={0.15} />
				{/each}
				<Points data={dots} x={(d) => d.date} y={(d) => d.value} r={2.5} fill={(d) => color[d.id]} opacity={0.45} />
				<RefLine y={5} label={t.threshold} />
				{#each series as s (s.id)}
					<Line data={s.values} x={(d) => d.date} y={(d) => d.value} stroke={color[s.id]} />
				{/each}
				<LineEndLabels
					data={ends}
					x={(d) => d.date}
					y={(d) => d.value}
					text={(d) => `${name(d.id)} ${fmt.format('.0f')(d.value)}`}
					color={(d) => color[d.id]}
				/>
				{#if hoverDate}
					<line class="crosshair" x1={plot.x(hoverDate)} x2={plot.x(hoverDate)} y2={plot.height} />
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
						<div class="tip-date">{fmt.timeFormat('%e %B %Y')(hoverDate)}</div>
						{#each series.toSorted((a, b) => b.values[index].value - a.values[index].value) as s (s.id)}
							<div class="tip-row">
								<span class="tip-key" style:background={color[s.id]}></span>
								<span>{name(s.id)}</span>
								<strong>{fmt.format('.1f')(s.values[index].value)}%</strong>
							</div>
						{/each}
					</Tooltip>
				{/if}
			</Html>
		{/snippet}
	</Plot>

	<Footer>
		<Notes>{illustrative[locale].notes}</Notes>
		<Source>{illustrative[locale].source}</Source>
	</Footer>
</Chart>

<style>
	.crosshair {
		stroke: var(--mz-color-axis);
		stroke-width: 1;
		shape-rendering: crispEdges;
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
