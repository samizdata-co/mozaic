<script lang="ts">
	import { Chart, DataDownload, DataTable } from '../../lib/frame/index.js';
	import { Table, type Column } from '../../lib/table/index.js';

	type Row = { name: string; value: number; trend: number[] };
	const rows: Row[] = [
		{ name: 'Cahul', value: 30.5, trend: [1, 2, 3] },
		{ name: 'Bălți', value: 1200, trend: [3, 2, 1] },
		{ name: 'Orhei', value: 7, trend: [2, 2, 2] },
		{ name: 'Soroca', value: 50, trend: [1, 3, 2] },
		{ name: 'Ungheni', value: 12, trend: [2, 1, 3] }
	];
	const columns: Column<Row>[] = [
		{ key: 'name', label: 'District', value: (d) => d.name },
		{ key: 'value', label: 'Value', value: (d) => d.value, type: 'bar' },
		{
			key: 'heat',
			label: 'Heat',
			value: (d) => d.value,
			type: 'heat',
			color: (v) => (v > 100 ? '#123b78' : '#e1ebf7')
		},
		{ key: 'trend', label: 'Trend', value: (d) => d.trend.at(-1), type: 'sparkline', series: (d) => d.trend }
	];
</script>

<Chart width={500} locale="ro">
	<Table data={rows} {columns} sortBy="value" maxRows={3} search caption="table-caption" />
	<DataTable data={rows} columns={columns.slice(0, 2)} />
	<DataDownload data={rows} columns={columns.slice(0, 2)} filename="districts" />
</Chart>
