<script lang="ts">
	import { scaleBand, scaleLinear } from 'd3-scale';
	import { max } from 'd3-array';
	import { Chart, Header, Title, Subtitle, Footer, Notes, Source } from '@samizdata/mozaic/frame';
	import { Plot, Svg, Html, estimateTextWidth, scaled } from '@samizdata/mozaic/core';
	import { Dumbbell } from '@samizdata/mozaic/marks';
	import { AxisX, AxisY, GridX, Legend } from '@samizdata/mozaic/guides';
	import { Tooltip } from '@samizdata/mozaic/interactive';
	import { createLocale } from '@samizdata/mozaic/locale';
	import type { ExampleProps } from '../types';
	import { illustrative } from '../common';
	import { messages, rows, type Row } from './data';

	let { style, locale, medium = 'web', width }: ExampleProps = $props();

	const t = $derived(messages[locale]);
	const fmt = $derived(createLocale(locale));
	const theme = $derived(style);
	const sorted = rows.toSorted((a, b) => b.men - b.women - (a.men - a.women));
	const names = $derived(sorted.map((d) => t.sectors[d.sector]));
	const x = scaleLinear()
		.domain([0, max(rows, (d) => d.men) ?? 1])
		.nice();
	const y = $derived(scaleBand<string>().domain(names).padding(0.4));
	const left = $derived(Math.max(...names.map((n) => estimateTextWidth(n, theme.plot.fontSize))) + 12);
	let hovered = $state<Row | null>(null);
</script>

<Chart {style} {locale} {medium} {width} alt={t.alt}>
	<Header>
		<Title>{t.title}</Title>
		<Subtitle>{t.subtitle}</Subtitle>
		<Legend
			shape="circle"
			items={[
				{ label: t.women, color: theme.palettes.categorical[1] },
				{ label: t.men, color: theme.palettes.categorical[0] }
			]}
		/>
	</Header>

	<Plot {x} {y} height={sorted.length * 34} padding={{ left, right: 16, top: 4, bottom: 24 }}>
		{#snippet children(plot)}
			<Svg>
				<GridX ticks={4} />
				<AxisX ticks={4} format={fmt.number} />
				<AxisY />
				<Dumbbell
					data={sorted}
					y={(d) => t.sectors[d.sector]}
					x1={(d) => d.women}
					x2={(d) => d.men}
					onpointerenter={(d) => (hovered = d)}
					onpointerleave={() => (hovered = null)}
				/>
			</Svg>
			<Html>
				{#if hovered}
					<Tooltip x={plot.x(hovered.men) ?? 0} y={scaled(plot.y, t.sectors[hovered.sector])}>
						<strong>{t.sectors[hovered.sector]}</strong><br />
						{t.women}: {fmt.number(hovered.women)}<br />{t.men}: {fmt.number(hovered.men)}<br />
						−{fmt.percent(1 - hovered.women / hovered.men)}
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
