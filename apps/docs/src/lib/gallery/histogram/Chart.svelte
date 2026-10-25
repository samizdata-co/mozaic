<script lang="ts">
	import { scaleLinear } from 'd3-scale';
	import { max, median } from 'd3-array';
	import { Chart, Header, Title, Subtitle, Footer, Notes, Source } from 'mozaic/frame';
	import { Plot, Svg, Html } from 'mozaic/core';
	import { Rects } from 'mozaic/marks';
	import { AxisX, AxisY, GridY } from 'mozaic/guides';
	import { RefLine } from 'mozaic/annotations';
	import { Tooltip } from 'mozaic/interactive';
	import { bin, type Bin } from 'mozaic/transforms';
	import { createLocale } from 'mozaic/locale';
	import { resolveStyle } from 'mozaic/styles';
	import type { ExampleProps } from '../types';
	import { illustrative } from '../common';
	import { incomes, messages } from './data';

	let { style, locale, medium = 'web', width }: ExampleProps = $props();

	const t = $derived(messages[locale]);
	const fmt = $derived(createLocale(locale));
	const theme = $derived(resolveStyle(style));
	const edges = Array.from({ length: 21 }, (_, i) => i * 2000);
	const bins = bin(incomes, (d) => d, { thresholds: edges });
	const mid = median(incomes) ?? 0;
	const x = scaleLinear().domain([0, 40000]);
	const y = scaleLinear()
		.domain([0, max(bins, (b) => b.count) ?? 1])
		.nice();
	let hovered = $state<Bin<number> | null>(null);
</script>

<Chart {style} {locale} {medium} {width} alt={t.alt}>
	<Header>
		<Title>{t.title}</Title>
		<Subtitle>{t.subtitle}</Subtitle>
	</Header>

	<Plot {x} {y} height={260} padding={{ left: 40, right: 12, top: 12, bottom: 28 }}>
		{#snippet children(plot)}
			<Svg>
				<GridY ticks={4} />
				<AxisY ticks={4} />
				<AxisX ticks={plot.breakpoint === 's' ? 4 : 8} format={fmt.number} />
				<Rects
					data={bins}
					x={(b) => b.x0}
					x2={(b) => b.x1}
					y={0}
					y2={(b) => b.count}
					inset={0.5}
					fill={theme.palettes.categorical[0]}
					opacity={(b) => (hovered && b !== hovered ? 0.45 : 1)}
					onpointerenter={(b) => (hovered = b)}
					onpointerleave={() => (hovered = null)}
				/>
				<RefLine x={mid} label="{t.median}: {fmt.number(Math.round(mid))}" />
			</Svg>
			<Html>
				{#if hovered}
					<Tooltip x={plot.x((hovered.x0 + hovered.x1) / 2) ?? 0} y={plot.y(hovered.count) ?? 0}>
						<strong>{fmt.number(hovered.x0)}–{fmt.number(hovered.x1)} lei</strong><br />{fmt.number(hovered.count)}
						{t.households}
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
