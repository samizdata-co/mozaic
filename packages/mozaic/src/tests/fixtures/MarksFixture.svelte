<script lang="ts">
	import { scaleLinear } from 'd3-scale';
	import { Chart } from '../../lib/frame/index.js';
	import { Plot, Svg } from '../../lib/core/index.js';
	import { Area, Line, LineEndLabels, Points, Rects, Rules, Text } from '../../lib/marks/index.js';
	import { GridX, GridY } from '../../lib/guides/index.js';
	import { Arrow, Callout, Label, RefBand, RefLine } from '../../lib/annotations/index.js';

	const data = [
		{ x: 0, y: 10 },
		{ x: 1, y: 30 },
		{ x: 2, y: NaN },
		{ x: 3, y: 20 },
		{ x: 4, y: 40 }
	];
	const x = scaleLinear().domain([0, 4]);
	const y = scaleLinear().domain([0, 50]);
	const twoLines = 'line one\nline two';
</script>

<Chart width={400}>
	<Plot {x} {y} height={200} width={400}>
		<Svg>
			<GridX ticks={4} />
			<GridY ticks={5} />
			<RefBand x1={1} x2={2} label="band-label" />
			<Area {data} x={(d) => d.x} y={(d) => d.y} opacity={0.2} />
			<Line {data} x={(d) => d.x} y={(d) => d.y} />
			<Points {data} x={(d) => d.x} y={(d) => d.y} title={(d) => `point ${d.x}`} />
			<Rects data={[{ a: 1, b: 2, c: 0, d: 10 }]} x={(d) => d.a} x2={(d) => d.b} y={(d) => d.c} y2={(d) => d.d} />
			<Rules y={[0, 25]} />
			<Text x={2} y={45} text={twoLines} halo />
			<Callout x={4} y={40} dx={-40} dy={-20} label="callout-label" />
			<RefLine y={35} label="target" />
			<Label x={1} y={30} label="labelled-point" marker />
			<Arrow from={[0, 10]} to={[1, 30]} />
			<LineEndLabels
				data={[
					{ x: 4, y: 40, n: 'A' },
					{ x: 4, y: 41, n: 'B' }
				]}
				x={(d) => d.x}
				y={(d) => d.y}
				text={(d) => d.n}
				color={() => 'red'}
			/>
		</Svg>
	</Plot>
</Chart>
