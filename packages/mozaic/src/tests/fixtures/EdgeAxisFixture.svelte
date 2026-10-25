<script lang="ts">
	import { scaleLinear } from 'd3-scale';
	import { Chart } from '../../lib/frame/index.js';
	import { Plot, Svg } from '../../lib/core/index.js';
	import { AxisX } from '../../lib/guides/index.js';
</script>

<Chart width={300}>
	<Plot
		x={scaleLinear().domain([0, 1000000])}
		height={20}
		width={300}
		padding={{ left: 0, right: 0, top: 0, bottom: 20 }}
	>
		<Svg><AxisX tickValues={[0, 500000, 1000000]} /></Svg>
	</Plot>
</Chart>
