<script lang="ts">
	import { scaleBand, scaleLinear } from 'd3-scale';
	import { max, min } from 'd3-array';
	import { Chart, Header, Title, Subtitle, Footer, Source, Notes } from 'mozaic/frame';
	import { Plot, Svg, Html, estimateTextWidth, scaled } from 'mozaic/core';
	import { Bars, Rules, Text } from 'mozaic/marks';
	import { AxisX, AxisY, GridX } from 'mozaic/guides';
	import { Callout } from 'mozaic/annotations';
	import { Tooltip } from 'mozaic/interactive';
	import { createLocale } from 'mozaic/locale';
	import { resolveStyle } from 'mozaic/styles';
	import type { ExampleProps } from '../types';
	import { messages, rows } from './data';

	let { style, locale, medium = 'web', width }: ExampleProps = $props();

	type Datum = { id: string; change: number; name: string };

	const t = $derived(messages[locale]);
	const fmt = $derived(createLocale(locale));
	const theme = $derived(resolveStyle(style));

	const data = $derived<Datum[]>(
		rows.map((d) => ({ ...d, name: t.sectors[d.id] })).toSorted((a, b) => b.change - a.change)
	);
	const top = $derived(data[0]);
	// On small screens category labels sit above the bars, so rows are taller.
	const rowHeight = (small: boolean) => (small ? 46 : 30);

	const x = $derived(
		scaleLinear()
			.domain([Math.min(0, min(data, (d) => d.change) ?? 0), max(data, (d) => d.change) ?? 1])
			.nice()
	);
	const y = $derived(
		scaleBand<string>()
			.domain(data.map((d) => d.name))
			.paddingInner(0.25)
			.paddingOuter(0.1)
	);
	// Left padding fits the longest category label.
	const labelWidth = $derived(Math.max(...data.map((d) => estimateTextWidth(d.name, theme.plot.fontSize))) + 12);

	const fill = (d: Datum) => (d.change >= 0 ? theme.palettes.semantic.positive : theme.palettes.semantic.negative);
	let hovered = $state<Datum | null>(null);
</script>

<Chart {style} {locale} {medium} {width} alt={t.alt}>
	<Header>
		<Title>{t.title}</Title>
		<Subtitle>{t.subtitle}</Subtitle>
	</Header>

	<Plot
		{x}
		{y}
		height={({ breakpoint }) => data.length * rowHeight(breakpoint === 's')}
		padding={({ breakpoint }) => ({
			left: breakpoint === 's' ? 0 : labelWidth,
			right: 24,
			top: breakpoint === 's' ? 16 : 4,
			bottom: 24
		})}
	>
		{#snippet children(plot)}
			{@const small = plot.breakpoint === 's'}
			<Svg>
				<GridX ticks={small ? 4 : 5} />
				<AxisX ticks={small ? 4 : 5} format={fmt.percent} />
				{#if small}
					<Text {data} x={x.domain()[0]} y={(d) => d.name} text={(d) => d.name} dy={-15} baseline="bottom" halo />
				{:else}
					<AxisY />
				{/if}
				<Bars
					{data}
					x={(d) => d.change}
					y={(d) => d.name}
					{fill}
					opacity={(d) => (hovered && hovered.id !== d.id ? 0.45 : 1)}
					onpointerenter={(d) => (hovered = d)}
					onpointerleave={() => (hovered = null)}
				/>
				<Rules x={[0]} />
				<Callout
					x={top.change}
					y={top.name}
					dx={-6}
					dy={rowHeight(small) * 4}
					anchor="end"
					curve="left"
					label={t.callout(fmt.signedPercent(top.change))}
				/>
			</Svg>
			<Html>
				{#if hovered}
					<Tooltip x={plot.x(hovered.change) ?? 0} y={scaled(plot.y, hovered.name)}>
						<strong>{hovered.name}</strong><br />{fmt.signedPercent(hovered.change)}
					</Tooltip>
				{/if}
			</Html>
		{/snippet}
	</Plot>

	<Footer>
		<Notes>{t.notes}</Notes>
		<Source>{t.source}</Source>
	</Footer>
</Chart>
