<script lang="ts">
	import { scaleBand, scaleLinear } from 'd3-scale';
	import { Chart } from '../../lib/frame/index.js';
	import { Plot, Svg } from '../../lib/core/index.js';
	import { Hemicycle, Intervals } from '../../lib/marks/index.js';

	let { total }: { total?: number } = $props();

	const parties = [
		{ name: 'A', seats: 55, share: 50, lo: 46, hi: 54, color: '#e0a800' },
		{ name: 'B', seats: 26, share: 24, lo: 21, hi: 27, color: '#d7263d' },
		{ name: 'C', seats: 20, share: 18, lo: 15, hi: 21, color: '#14a38b' }
	];
</script>

<Chart width={400}>
	<Plot height={200} width={400}>
		<Svg>
			<Hemicycle
				data={parties}
				value={(d) => d.seats}
				fill={(d) => d.color}
				{total}
				majorityLine
				majorityLabel="51 for a majority"
				title={(d) => `${d.name}: ${d.seats}`}
			>
				{#snippet center(g)}<text class="total" x={g.cx} y={g.cy}>101</text>{/snippet}
			</Hemicycle>
		</Svg>
	</Plot>
	<Plot
		x={scaleLinear().domain([0, 60])}
		y={scaleBand()
			.domain(parties.map((d) => d.name))
			.padding(0.3)}
		height={120}
		width={400}
	>
		<Svg>
			<Intervals
				data={parties}
				y={(d) => d.name}
				x={(d) => d.share}
				x1={(d) => d.lo}
				x2={(d) => d.hi}
				fill={(d) => d.color}
				title={(d) => d.name}
			/>
		</Svg>
	</Plot>
</Chart>
