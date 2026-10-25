<script lang="ts">
	import { scaleLinear } from 'd3-scale';
	import { extent } from 'd3-array';
	import { Chart, Header, Title, Subtitle, Footer, Notes, Source } from 'mozaic/frame';
	import { Canvas, Plot, Svg } from 'mozaic/core';
	import { Points } from 'mozaic/marks';
	import { AxisX, AxisY, GridX, GridY, Legend } from 'mozaic/guides';
	import { resolveStyle } from 'mozaic/styles';
	import type { ExampleProps } from '../types';
	import { illustrative } from '../common';
	import { messages, points } from './data';

	let { style, locale, medium = 'web', width }: ExampleProps = $props();

	const t = $derived(messages[locale]);
	const theme = $derived(resolveStyle(style));
	const colors = $derived([theme.palettes.categorical[0], theme.palettes.categorical[1]]);
	const x = scaleLinear()
		.domain(extent(points, (d) => d.x) as [number, number])
		.nice();
	const y = scaleLinear()
		.domain(extent(points, (d) => d.y) as [number, number])
		.nice();
	// Print has no canvas: draw a 1-in-5 sample as SVG instead.
	const sample = points.filter((_, i) => i % 5 === 0);
</script>

<Chart {style} {locale} {medium} {width} alt={t.alt}>
	<Header>
		<Title>{t.title}</Title>
		<Subtitle>{t.subtitle}</Subtitle>
		<Legend shape="circle" items={t.groups.map((label, i) => ({ label, color: colors[i] }))} />
	</Header>

	<Plot {x} {y} height={320} padding={{ left: 32, right: 12, top: 8, bottom: 24 }}>
		{#snippet children(plot)}
			<Svg>
				<GridX ticks={5} />
				<GridY ticks={5} />
				<AxisX ticks={5} />
				<AxisY ticks={5} />
				{#if plot.medium === 'print'}
					<Points
						data={sample}
						x={(d) => d.x}
						y={(d) => d.y}
						r={1.5}
						strokeWidth={0}
						fill={(d) => colors[d.cluster]}
						opacity={0.5}
					/>
				{/if}
			</Svg>
			{#if plot.medium !== 'print'}
				<Canvas
					draw={(ctx, p) => {
						ctx.globalAlpha = 0.35;
						for (const d of points) {
							ctx.fillStyle = colors[d.cluster];
							ctx.beginPath();
							ctx.arc(p.x(d.x) ?? 0, p.y(d.y) ?? 0, 1.8, 0, Math.PI * 2);
							ctx.fill();
						}
					}}
				/>
			{/if}
		{/snippet}
	</Plot>

	<Footer>
		<Notes>{illustrative[locale].notes}</Notes>
		<Source>{illustrative[locale].source}</Source>
	</Footer>
</Chart>
