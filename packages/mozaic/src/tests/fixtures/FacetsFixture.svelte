<script lang="ts">
	import { scaleLinear } from 'd3-scale';
	import { Chart } from '../../lib/frame/index.js';
	import { Facets, Plot, Svg } from '../../lib/core/index.js';
	import { Line } from '../../lib/marks/index.js';

	const groups = ['A', 'B', 'C'].map((name, k) => ({ name, values: [0, 1, 2].map((x) => ({ x, y: x * k })) }));
	const x = scaleLinear().domain([0, 2]);
	const y = scaleLinear().domain([0, 4]);
</script>

<Chart width={600}>
	<Facets {groups} columns={{ s: 1, m: 2 }} title={(g) => `panel ${g.name}`}>
		{#snippet children(group)}
			<Plot {x} {y} height={80}>
				<Svg><Line data={group.values} x={(d) => d.x} y={(d) => d.y} /></Svg>
			</Plot>
		{/snippet}
	</Facets>
</Chart>
