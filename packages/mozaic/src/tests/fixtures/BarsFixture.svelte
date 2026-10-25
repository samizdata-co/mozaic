<script lang="ts">
	import { scaleBand, scaleLinear } from 'd3-scale';
	import { Chart, Header, Title, Footer, Source } from '../../lib/frame/index.js';
	import { Plot, Svg, Html } from '../../lib/core/index.js';
	import { Bars } from '../../lib/marks/index.js';
	import { AxisX, AxisY } from '../../lib/guides/index.js';
	import { Tooltip } from '../../lib/interactive/index.js';
	import type { LocaleCode } from '../../lib/locale/index.js';
	import type { Medium, StyleName } from '../../lib/styles/index.js';

	let {
		style = 'base',
		locale = 'en',
		medium = 'web',
		orientation = 'horizontal'
	}: { style?: StyleName; locale?: LocaleCode; medium?: Medium; orientation?: 'horizontal' | 'vertical' } = $props();

	const data = [
		{ name: 'A', value: 1200.5 },
		{ name: 'B', value: 300 },
		{ name: 'C', value: -50 }
	];
	const band = scaleBand<string>().domain(data.map((d) => d.name));
	const linear = scaleLinear().domain([-100, 1500]);
</script>

<Chart {style} {locale} {medium} width={400} alt="Test bars">
	<Header><Title>Bars title</Title></Header>
	<Plot
		x={orientation === 'horizontal' ? linear : band}
		y={orientation === 'horizontal' ? band : linear}
		height={120}
		width={400}
	>
		<Svg>
			<AxisX ticks={3} />
			<AxisY ticks={3} />
			{#if orientation === 'horizontal'}
				<Bars {data} x={(d) => d.value} y={(d) => d.name} />
			{:else}
				<Bars {data} x={(d) => d.name} y={(d) => d.value} />
			{/if}
		</Svg>
		<Html><Tooltip x={10} y={10}>tooltip-content</Tooltip></Html>
	</Plot>
	<Footer><Source>Test source</Source></Footer>
</Chart>
