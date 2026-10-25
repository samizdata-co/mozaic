<script lang="ts">
	import { scaleDiverging } from 'd3-scale';
	import { interpolateRgbBasis } from 'd3-interpolate';
	import { Chart, Header, Title, Subtitle, Footer, Notes, Source, DataDownload } from 'mozaic/frame';
	import { Table, type Column } from 'mozaic/table';
	import { createLocale } from 'mozaic/locale';
	import { resolveStyle } from 'mozaic/styles';
	import type { ExampleProps } from '../types';
	import { illustrative } from '../common';
	import { messages, rows, type Row } from './data';

	let { style, locale, medium = 'web', width }: ExampleProps = $props();

	const t = $derived(messages[locale]);
	const fmt = $derived(createLocale(locale));
	const theme = $derived(resolveStyle(style));
	const heat = $derived(
		scaleDiverging(interpolateRgbBasis(theme.palettes.diverging)).domain([-0.1, 0, 0.1]).clamp(true)
	);

	const columns = $derived<Column<Row>[]>([
		{ key: 'district', label: t.columns.district, value: (d) => d.district },
		{ key: 'population', label: t.columns.population, value: (d) => d.population, type: 'bar' },
		{
			key: 'change',
			label: t.columns.change,
			value: (d) => d.change,
			type: 'heat',
			format: (v: number) => fmt.format('+.1%')(v),
			color: (v: number) => {
				// d3 returns rgb(); the table needs hex to pick a readable text colour.
				const [r, g, b] = heat(v).match(/\d+/g)!.map(Number);
				return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
			}
		},
		{ key: 'income', label: t.columns.income, value: (d) => d.income },
		{
			key: 'trend',
			label: t.columns.trend,
			value: (d) => d.trend[d.trend.length - 1],
			type: 'sparkline',
			series: (d) => d.trend,
			sortable: false
		}
	]);
</script>

<Chart {style} {locale} {medium} {width} alt={t.alt}>
	<Header>
		<Title>{t.title}</Title>
		<Subtitle>{t.subtitle}</Subtitle>
	</Header>

	<Table data={rows} {columns} sortBy="population" maxRows={8} search />

	<Footer>
		<Notes>{illustrative[locale].notes}</Notes>
		<Source>{illustrative[locale].source}</Source>
	</Footer>
	<DataDownload data={rows} columns={columns.slice(0, 4)} filename="districts" />
</Chart>
