<script lang="ts">
	import { scaleLinear } from 'd3-scale';
	import { Chart } from '../../lib/frame/index.js';
	import { Html, Plot, Svg } from '../../lib/core/index.js';
	import { Area, Line, LineEndLabels, Points, Rects, Rules, Text } from '../../lib/marks/index.js';
	import { AxisY, GridX, GridY } from '../../lib/guides/index.js';
	import { Tooltip } from '../../lib/interactive/index.js';
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
			<AxisY ticks={5} unit="lei/m³" />
			<RefBand x1={1} x2={2} label="band-label" />
			<Area {data} x={(d) => d.x} y={(d) => d.y} opacity={0.2} />
			<Line {data} x={(d) => d.x} y={(d) => d.y} />
			<Points {data} x={(d) => d.x} y={(d) => d.y} title={(d) => `point ${d.x}`} />
			<Rects data={[{ a: 1, b: 2, c: 0, d: 10 }]} x={(d) => d.a} x2={(d) => d.b} y={(d) => d.c} y2={(d) => d.d} />
			<Rules y={[0, 25]} />
			<Text x={2} y={45} text={twoLines} halo />
			<Callout x={4} y={40} dx={-40} dy={-20} label="callout-label" />
			<Callout x={3} y={20} dx={-40} dy={-20} label="coloured-callout" color="#f0e442" class="coloured" />
			<RefLine y={35} label="target" />
			<RefLine x={2} label={twoLines} labelY={-30} anchor="end" dotted />
			<Label x={1} y={30} label="labelled-point" marker />
			<Label x={3} y={20} label="coloured-point" marker color="#f0e442" class="coloured" />
			<Arrow from={[0, 10]} to={[1, 30]} />
			<LineEndLabels
				data={[
					{ x: 4, y: 40, n: 'A' },
					{ x: 4, y: 41, n: 'B' }
				]}
				x={(d) => d.x}
				y={(d) => d.y}
				text={(d) => d.n}
				color={(d) => (d.n === 'A' ? '#1f77b4' : '#f0e442')}
				colorText
			/>
		</Svg>
		<Html>
			<Tooltip
				x={10}
				y={10}
				title="tooltip-title"
				items={[
					{ label: 'A', value: '1,00', color: 'red', shape: 'line' },
					{ label: 'Longer B', value: '20,00', color: 'blue' }
				]}
			/>
		</Html>
	</Plot>
</Chart>
