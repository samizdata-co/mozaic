<script lang="ts">
	import { scaleBand, scaleLinear } from 'd3-scale';
	import { max } from 'd3-array';
	import { Chart, Header, Title, Subtitle, Footer, Notes, Source, DataTable } from '@samizdata/mozaic/frame';
	import { Plot, Svg, Html, scaled } from '@samizdata/mozaic/core';
	import { Bars } from '@samizdata/mozaic/marks';
	import { AxisX, AxisY, GridY, Legend } from '@samizdata/mozaic/guides';
	import { ButtonGroup, Tooltip } from '@samizdata/mozaic/interactive';
	import { stack, type StackedRow } from '@samizdata/mozaic/transforms';
	import { createLocale } from '@samizdata/mozaic/locale';
	import type { ExampleProps } from '../types';
	import { illustrative } from '../common';
	import { messages, rows, sources, type Row } from './data';

	let { style, locale, medium = 'web', width }: ExampleProps = $props();

	const t = $derived(messages[locale]);
	const fmt = $derived(createLocale(locale));
	const theme = $derived(style);
	const color = $derived(Object.fromEntries(sources.map((s, i) => [s, theme.palettes.categorical[i]])));

	let measure = $state<'total' | 'share'>('total');
	const stacked = $derived(
		stack(rows, {
			key: (d) => d.year,
			series: (d) => d.source,
			value: (d) => d.twh,
			seriesOrder: [...sources],
			offset: measure === 'share' ? 'expand' : 'none'
		})
	);
	const years = [...new Set(rows.map((d) => d.year))];
	const x = scaleBand<string>().domain(years).paddingInner(0.25).paddingOuter(0.1);
	const y = $derived(
		scaleLinear()
			.domain([0, measure === 'share' ? 1 : (max(stacked, (d) => d.end) ?? 1)])
			.nice()
	);
	const valueFormat = $derived(measure === 'share' ? fmt.percent : fmt.format(',.1f'));

	let hovered = $state<StackedRow<Row> | null>(null);
</script>

<Chart {style} {locale} {medium} {width} alt={t.alt}>
	<Header>
		<Title>{t.title}</Title>
		<Subtitle>{t.subtitle}</Subtitle>
		<Legend items={sources.map((s) => ({ label: t.sources[s], color: color[s] }))} />
		<ButtonGroup
			label={t.measure}
			options={[
				{ value: 'total', label: t.total },
				{ value: 'share', label: t.share }
			]}
			bind:value={measure}
		/>
	</Header>

	<Plot
		{x}
		{y}
		height={({ breakpoint }) => (breakpoint === 's' ? 240 : 300)}
		padding={{ left: 40, right: 8, top: 8, bottom: 28 }}
	>
		{#snippet children(plot)}
			<Svg>
				<GridY ticks={5} />
				<AxisY ticks={5} format={valueFormat} />
				<AxisX tickValues={years.filter((_, i) => plot.breakpoint !== 's' || i % 2 === 0)} />
				<Bars
					data={stacked}
					x={(d) => String(d.key)}
					y={(d) => d.end}
					base={(d) => d.start}
					fill={(d) => color[d.series]}
					opacity={(d) => (hovered && hovered.series !== d.series ? 0.4 : 1)}
					radius={0}
					gap={1}
					onpointerenter={(d) => (hovered = d)}
					onpointerleave={() => (hovered = null)}
				/>
			</Svg>
			<Html>
				{#if hovered}
					<Tooltip x={scaled(plot.x, String(hovered.key))} y={plot.y((hovered.start + hovered.end) / 2) ?? 0}>
						<strong>{t.sources[hovered.series as Row['source']]}, {hovered.key}</strong><br />
						{fmt.format(',.2f')(hovered.value)}
						{t.unit}{#if measure === 'share'}
							({fmt.percent(hovered.end - hovered.start)}){/if}
					</Tooltip>
				{/if}
			</Html>
		{/snippet}
	</Plot>

	<Footer>
		<Notes>{illustrative[locale].notes}</Notes>
		<Source>{illustrative[locale].source}</Source>
	</Footer>
	<DataTable
		data={rows}
		columns={[
			{ key: 'year', label: '', value: (d: Row) => d.year },
			{ key: 'source', label: t.measure, value: (d: Row) => t.sources[d.source] },
			{ key: 'twh', label: t.unit, value: (d: Row) => d.twh }
		]}
		maxRows={10}
	/>
</Chart>
