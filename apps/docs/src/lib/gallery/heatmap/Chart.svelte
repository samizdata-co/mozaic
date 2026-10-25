<script lang="ts">
	import { scaleBand, scaleDiverging } from 'd3-scale';
	import { interpolateRgbBasis } from 'd3-interpolate';
	import { Chart, Header, Title, Subtitle, Footer, Notes, Source } from 'mozaic/frame';
	import { Plot, Svg, Html, scaled } from 'mozaic/core';
	import { Rects } from 'mozaic/marks';
	import { AxisX, AxisY, ColorRamp } from 'mozaic/guides';
	import { Tooltip } from 'mozaic/interactive';
	import { createLocale } from 'mozaic/locale';
	import { resolveStyle } from 'mozaic/styles';
	import type { ExampleProps } from '../types';
	import { illustrative } from '../common';
	import { cells, messages, years, type Cell } from './data';

	let { style, locale, medium = 'web', width }: ExampleProps = $props();

	const t = $derived(messages[locale]);
	const fmt = $derived(createLocale(locale));
	const theme = $derived(resolveStyle(style));
	// Diverging: the style's two poles with a neutral grey at zero.
	const color = $derived(scaleDiverging(interpolateRgbBasis(theme.palettes.diverging)).domain([-2, 0, 2]).clamp(true));
	const monthName = $derived((m: number) => fmt.timeFormat('%b')(new Date(2020, m, 1)));
	const x = scaleBand<number>().domain(Array.from({ length: 12 }, (_, i) => i));
	const y = scaleBand<string>().domain(years);
	let hovered = $state<Cell | null>(null);
</script>

<Chart {style} {locale} {medium} {width} alt={t.alt}>
	<Header>
		<Title>{t.title}</Title>
		<Subtitle>{t.subtitle}</Subtitle>
		<ColorRamp scale={color} title={t.legend} tickValues={[-2, -1, 0, 1, 2]} format={fmt.format('+.0f')} width={220} />
	</Header>

	<Plot {x} {y} height={years.length * 22} padding={{ left: 40, right: 4, top: 4, bottom: 24 }}>
		{#snippet children(plot)}
			<Svg>
				<AxisX
					format={(m: number) => (plot.breakpoint === 's' ? monthName(m).slice(0, 1).toUpperCase() : monthName(m))}
				/>
				<AxisY />
				<Rects
					data={cells}
					x={(d) => d.month}
					y={(d) => d.year}
					inset={1}
					fill={(d) => color(d.anomaly)}
					onpointerenter={(d) => (hovered = d)}
					onpointerleave={() => (hovered = null)}
				/>
			</Svg>
			<Html>
				{#if hovered}
					<Tooltip x={scaled(plot.x, hovered.month)} y={scaled(plot.y, hovered.year)}>
						<strong>{monthName(hovered.month)} {hovered.year}</strong><br />{fmt.format('+.1f')(hovered.anomaly)} °C
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
