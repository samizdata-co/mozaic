<script lang="ts">
	import { scaleBand, scaleLinear } from 'd3-scale';
	import { Chart } from '../../lib/frame/index.js';
	import { Plot, Svg } from '../../lib/core/index.js';
	import { Bars } from '../../lib/marks/index.js';
	import { stack } from '../../lib/transforms/index.js';

	let { mode = 'grouped' }: { mode?: 'grouped' | 'stacked' } = $props();

	const rows = [
		{ year: '2020', party: 'A', seats: 10 },
		{ year: '2020', party: 'B', seats: 5 },
		{ year: '2021', party: 'A', seats: 8 },
		{ year: '2021', party: 'B', seats: 12 }
	];
	const stacked = stack(rows, { key: (d) => d.year, series: (d) => d.party, value: (d) => d.seats });
	const x = scaleBand<string>().domain(['2020', '2021']);
	const y = scaleLinear().domain([0, 20]);
</script>

<Chart width={300}>
	<Plot {x} {y} height={100} width={300}>
		<Svg>
			{#if mode === 'grouped'}
				<Bars data={rows} x={(d) => d.year} y={(d) => d.seats} group={(d) => d.party} />
			{:else}
				<Bars data={stacked} x={(d) => String(d.key)} y={(d) => d.end} base={(d) => d.start} radius={0} gap={1} />
			{/if}
		</Svg>
	</Plot>
</Chart>
