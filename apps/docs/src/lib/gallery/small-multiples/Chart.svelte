<script lang="ts">
	import { scaleLinear } from 'd3-scale';
	import { extent } from 'd3-array';
	import { Chart, Header, Title, Subtitle, Footer, Notes, Source } from 'mozaic/frame';
	import { Facets, Plot, Svg } from 'mozaic/core';
	import { Area, Line } from 'mozaic/marks';
	import { AxisX, AxisY, GridY } from 'mozaic/guides';
	import type { ExampleProps } from '../types';
	import { illustrative } from '../common';
	import { messages, series } from './data';

	let { style, locale, medium = 'web', width }: ExampleProps = $props();

	const t = $derived(messages[locale]);
	const theme = $derived(style);
	// One set of scales for every panel, so the panels are comparable.
	const all = series.flatMap((s) => s.values);
	const x = scaleLinear().domain([2015, 2025]);
	const y = scaleLinear()
		.domain(extent(all, (d) => d.value) as [number, number])
		.nice();
	const falling = (s: (typeof series)[number]) => s.values[s.values.length - 1].value < s.values[0].value;
</script>

<Chart {style} {locale} {medium} {width} alt={t.alt}>
	<Header>
		<Title>{t.title}</Title>
		<Subtitle>{t.subtitle}</Subtitle>
	</Header>

	<Facets groups={series} columns={{ s: 2, m: 3 }} title={(s) => t.names[s.id]}>
		{#snippet children(s)}
			<!-- The exception in the highlight colour; the rest recede. -->
			{@const color = falling(s) ? theme.palettes.semantic.highlight : theme.palettes.semantic.neutral}
			<Plot {x} {y} height={90} padding={{ left: 26, right: 6, top: 6, bottom: 20 }}>
				<Svg>
					<GridY ticks={3} />
					<AxisY ticks={3} />
					<AxisX tickValues={[2015, 2025]} format={String} />
					<Area data={s.values} x={(d) => d.year} y={(d) => d.value} y0={y.domain()[0]} fill={color} opacity={0.12} />
					<Line data={s.values} x={(d) => d.year} y={(d) => d.value} stroke={color} />
				</Svg>
			</Plot>
		{/snippet}
	</Facets>

	<Footer>
		<Notes>{illustrative[locale].notes}</Notes>
		<Source>{illustrative[locale].source}</Source>
	</Footer>
</Chart>
