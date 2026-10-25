<script lang="ts">
	import { scaleLinear } from 'd3-scale';
	import { extent } from 'd3-array';
	import { Chart, Header, Title, Subtitle, Footer, Notes, Source } from 'mozaic/frame';
	import { Plot, Svg, Html } from 'mozaic/core';
	import { Beeswarm } from 'mozaic/marks';
	import { AxisX, GridX } from 'mozaic/guides';
	import { Label } from 'mozaic/annotations';
	import { Tooltip } from 'mozaic/interactive';
	import { createLocale } from 'mozaic/locale';
	import { resolveStyle } from 'mozaic/styles';
	import type { ExampleProps } from '../types';
	import { illustrative } from '../common';
	import { messages, rows, type Row } from './data';

	let { style, locale, medium = 'web', width }: ExampleProps = $props();

	const t = $derived(messages[locale]);
	const fmt = $derived(createLocale(locale));
	const theme = $derived(resolveStyle(style));
	const highlighted = new Set(['Chișinău', 'Bălți']);
	const x = scaleLinear()
		.domain(extent(rows, (d) => d.perResident) as [number, number])
		.nice();
	let hovered = $state<Row | null>(null);
</script>

<Chart {style} {locale} {medium} {width} alt={t.alt}>
	<Header>
		<Title>{t.title}</Title>
		<Subtitle>{t.subtitle}</Subtitle>
	</Header>

	<Plot {x} height={150} padding={{ left: 12, right: 24, top: 8, bottom: 28 }}>
		{#snippet children(plot)}
			<Svg>
				<GridX ticks={5} />
				<AxisX ticks={5} format={fmt.number} />
				<Beeswarm
					data={rows}
					x={(d) => d.perResident}
					r={6}
					fill={(d) => (highlighted.has(d.name) ? theme.palettes.semantic.highlight : theme.palettes.semantic.context)}
					opacity={(d) => (hovered && hovered !== d ? 0.5 : 1)}
					onpointerenter={(d) => (hovered = d)}
					onpointerleave={() => (hovered = null)}
				/>
				{#each rows.filter((d) => highlighted.has(d.name)) as d (d.name)}
					<Label
						x={d.perResident}
						y={plot.y.invert?.(plot.height / 2)}
						label={d.name}
						dx={0}
						dy={-20}
						anchor="middle"
						bold
					/>
				{/each}
			</Svg>
			<Html>
				{#if hovered}
					<Tooltip x={plot.x(hovered.perResident) ?? 0} y={plot.height / 2}>
						<strong>{hovered.name}</strong><br />{fmt.number(hovered.perResident)} lei
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
