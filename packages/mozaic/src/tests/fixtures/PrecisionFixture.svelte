<script lang="ts">
	import { scaleLinear } from 'd3-scale';
	import { curveMonotoneX } from 'd3-shape';
	import { Chart } from '../../lib/frame/index.js';
	import { Plot, Svg } from '../../lib/core/index.js';
	import { Area, Line, Points } from '../../lib/marks/index.js';

	// Values that fall between pixels, so every coordinate has a long tail of decimals before rounding.
	const data = [0, 1, 2, 3, 4, 5, 6].map((i) => ({ x: i / 3, y: 10 / 7 + i * Math.PI }));
	const x = scaleLinear().domain([0, 2]);
	const y = scaleLinear().domain([0, 23]);
</script>

<Chart width={313}>
	<Plot {x} {y} height={177} width={313}>
		<Svg>
			<Area {data} x={(d) => d.x} y={(d) => d.y} />
			<Line {data} x={(d) => d.x} y={(d) => d.y} curve={curveMonotoneX} />
			<Points {data} x={(d) => d.x} y={(d) => d.y} />
		</Svg>
	</Plot>
</Chart>
