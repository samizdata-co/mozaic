<script lang="ts">
	import { scaleOrdinal, scaleSequential, scaleSqrt, scaleThreshold } from 'd3-scale';
	import { interpolateBlues } from 'd3-scale-chromatic';
	import { Chart, Header } from '../../lib/frame/index.js';
	import { ColorRamp, Key, Legend, SizeLegend } from '../../lib/guides/index.js';

	const threshold = scaleThreshold<number, string>().domain([10, 20]).range(['#eee', '#aaa', '#333']);
	const ordinal = scaleOrdinal<string, string>().domain(['North', 'South']).range(['red', 'blue']);
</script>

<Chart width={400} locale="ro">
	<Header>
		<Legend scale={threshold} />
		<Legend scale={ordinal} shape="line" />
		<ColorRamp scale={scaleSequential(interpolateBlues).domain([0, 1000])} title="ramp-title" />
		<SizeLegend scale={scaleSqrt().domain([0, 100]).range([0, 20])} values={[10, 100]} />
		<p>Spending on <Key color="#f00">health</Key></p>
	</Header>
</Chart>
