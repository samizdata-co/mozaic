<script lang="ts">
	import { scaleLinear, scaleTime } from 'd3-scale';
	import { bisector, extent, max } from 'd3-array';
	import { curveMonotoneX } from 'd3-shape';
	import { Chart, Header, Title, Subtitle, Footer, Notes, Source } from 'mozaic/frame';
	import { Plot, Svg, Html } from 'mozaic/core';
	import { Area, Line, Points } from 'mozaic/marks';
	import { AxisX, AxisY, GridY } from 'mozaic/guides';
	import { RefBand, RefLine } from 'mozaic/annotations';
	import { PointerArea, Tooltip } from 'mozaic/interactive';
	import { createLocale } from 'mozaic/locale';
	import type { ExampleProps } from '../types';
	import { illustrative } from '../common';
	import { messages, points, type Point } from './data';

	let { style, locale, medium = 'web', width }: ExampleProps = $props();

	const t = $derived(messages[locale]);
	const fmt = $derived(createLocale(locale));
	const theme = $derived(style);
	const stroke = $derived(theme.palettes.categorical[0]);

	const x = scaleTime().domain(extent(points, (d) => d.date) as [Date, Date]);
	const y = scaleLinear()
		.domain([0, max(points, (d) => d.rate) ?? 0.1])
		.nice();
	const nearest = bisector<Point, Date>((d) => d.date).center;
	let hover = $state<Point | null>(null);
</script>

<Chart {style} {locale} {medium} {width} alt={t.alt}>
	<Header>
		<Title>{t.title}</Title>
		<Subtitle>{t.subtitle}</Subtitle>
	</Header>

	<Plot
		{x}
		{y}
		height={({ breakpoint }) => (breakpoint === 's' ? 220 : 300)}
		padding={{ left: 40, right: 12, top: 12, bottom: 28 }}
	>
		{#snippet children(plot)}
			<Svg>
				<RefBand x1={new Date(2020, 2, 1)} x2={new Date(2021, 5, 1)} label={t.band} />
				<GridY ticks={4} />
				<AxisY ticks={4} format={fmt.percent} />
				<AxisX ticks={plot.breakpoint === 's' ? 4 : 8} />
				<Area data={points} x={(d) => d.date} y={(d) => d.rate} fill={stroke} opacity={0.12} curve={curveMonotoneX} />
				<Line data={points} x={(d) => d.date} y={(d) => d.rate} {stroke} curve={curveMonotoneX} />
				<RefLine y={0.04} label={t.target} />
				{#if hover}<Points data={[hover]} x={(d) => d.date} y={(d) => d.rate} fill={stroke} />{/if}
				<PointerArea
					onmove={({ x: px }) => (hover = points[nearest(points, plot.x.invert?.(px))] ?? null)}
					onleave={() => (hover = null)}
				/>
			</Svg>
			<Html>
				{#if hover}
					<Tooltip x={plot.x(hover.date) ?? 0} y={plot.y(hover.rate) ?? 0}>
						<strong>{fmt.timeFormat('%B %Y')(hover.date)}</strong><br />{fmt.format('.1%')(hover.rate)}
					</Tooltip>
				{/if}
			</Html>
		{/snippet}
	</Plot>

	<Footer>
		<Notes>{illustrative[locale].notes}</Notes>
		<Source>{illustrative[locale].source}</Source>
	</Footer>
</Chart>
