<script lang="ts">
	import { scaleBand, scaleLinear } from 'd3-scale';
	import { Chart } from '../../lib/frame/index.js';
	import { Plot, Svg } from '../../lib/core/index.js';
	import { Arcs, Arrows, Beeswarm, Dumbbell, Slope, Treemap, Waffle } from '../../lib/marks/index.js';

	let {
		kind,
		active = null
	}: {
		kind: 'treemap' | 'waffle' | 'waffle-bottom' | 'dumbbell' | 'arrows' | 'slope' | 'beeswarm' | 'arcs';
		active?: number | null;
	} = $props();

	const items = [
		{ name: 'Alpha', group: 'g1', a: 10, b: 14 },
		{ name: 'Beta', group: 'g1', a: 6, b: 4 },
		{ name: 'Gamma', group: 'g2', a: 3, b: 9 },
		{ name: 'Delta', group: 'g2', a: 12, b: 11 }
	];
	const band = scaleBand<string>().domain(items.map((d) => d.name));
	const linear = scaleLinear().domain([0, 15]);
</script>

<Chart width={400}>
	{#if kind === 'dumbbell'}
		<Plot x={linear} y={band} height={160} width={400}>
			<Svg><Dumbbell data={items} y={(d) => d.name} x1={(d) => d.a} x2={(d) => d.b} /></Svg>
		</Plot>
	{:else if kind === 'arrows'}
		<Plot x={linear} y={band} height={160} width={400}>
			<Svg><Arrows data={items} y={(d) => d.name} x1={(d) => d.a} x2={(d) => d.b} /></Svg>
		</Plot>
	{:else if kind === 'slope'}
		<Plot y={linear} height={160} width={400} padding={{ left: 80, right: 80, top: 20, bottom: 8 }}>
			<Svg
				><Slope
					data={items}
					start={(d) => d.a}
					end={(d) => d.b}
					label={(d) => d.name}
					headings={['2015', '2025']}
				/></Svg
			>
		</Plot>
	{:else if kind === 'beeswarm'}
		<Plot x={linear} height={80} width={400}>
			<Svg><Beeswarm data={[...items, ...items]} x={(d) => d.a} /></Svg>
		</Plot>
	{:else}
		<Plot height={200} width={400} padding={{ top: 0, right: 0, bottom: 0, left: 0 }}>
			<Svg>
				{#if kind === 'treemap'}
					<Treemap data={items} value={(d) => d.a} group={(d) => d.group} label={(d) => d.name} />
				{:else if kind === 'waffle'}
					<Waffle data={items} value={(d) => d.a} total={40} {active} />
				{:else if kind === 'waffle-bottom'}
					<Waffle data={items} value={(d) => d.a} total={40} origin="bottom" />
				{:else}
					<Arcs data={items} value={(d) => d.a} label={(d) => d.name} />
				{/if}
			</Svg>
		</Plot>
	{/if}
</Chart>
