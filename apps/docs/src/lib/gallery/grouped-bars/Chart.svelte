<script lang="ts">
	import { scaleBand, scaleLinear } from 'd3-scale';
	import { Chart, Header, Title, Subtitle, Footer, Notes, Source } from 'mozaic/frame';
	import { Plot, Svg, Html, scaled } from 'mozaic/core';
	import { Bars } from 'mozaic/marks';
	import { AxisX, AxisY, GridX, Key } from 'mozaic/guides';
	import { Tooltip } from 'mozaic/interactive';
	import { createLocale } from 'mozaic/locale';
	import { resolveStyle } from 'mozaic/styles';
	import type { ExampleProps } from '../types';
	import { illustrative } from '../common';
	import { groups, messages, rows, type Row } from './data';

	let { style, locale, medium = 'web', width }: ExampleProps = $props();

	const t = $derived(messages[locale]);
	const fmt = $derived(createLocale(locale));
	const theme = $derived(resolveStyle(style));
	const color = $derived({ women: theme.palettes.categorical[0], men: theme.palettes.categorical[1] });

	const ages = [...new Set(rows.map((d) => d.age))];
	const x = scaleLinear().domain([0, 0.8]);
	const y = scaleBand<string>().domain(ages).paddingInner(0.3).paddingOuter(0.1);
	let hovered = $state<Row | null>(null);
</script>

<Chart {style} {locale} {medium} {width} alt={t.alt}>
	<Header>
		<Title>{t.title}</Title>
		<!-- An inline legend: the subtitle names the series next to their colours. -->
		<Subtitle
			>{t.subtitle}: <Key color={color.women}>{t.groups.women}</Key> · <Key color={color.men}>{t.groups.men}</Key
			></Subtitle
		>
	</Header>

	<Plot {x} {y} height={ages.length * 52} padding={{ left: 48, right: 40, top: 4, bottom: 24 }}>
		{#snippet children(plot)}
			<Svg>
				<GridX ticks={4} />
				<AxisX ticks={4} format={fmt.percent} />
				<AxisY />
				<Bars
					data={rows}
					x={(d) => d.rate}
					y={(d) => d.age}
					group={(d) => d.group}
					groups={[...groups]}
					groupPadding={0.1}
					fill={(d) => color[d.group]}
					onpointerenter={(d) => (hovered = d)}
					onpointerleave={() => (hovered = null)}
				/>
			</Svg>
			<Html>
				{#if hovered}
					<Tooltip x={plot.x(hovered.rate) ?? 0} y={scaled(plot.y, hovered.age)}>
						<strong>{t.groups[hovered.group]}, {hovered.age}</strong><br />{fmt.percent(hovered.rate)}
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
