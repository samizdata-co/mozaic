<!-- A scrollytelling story: a full page, not an embed. The chart reacts to the active step. -->
<script lang="ts">
	import { scaleLinear } from 'd3-scale';
	import { Chart, Header, Title, Footer, Notes, Source } from 'mozaic/frame';
	import { Plot, Svg } from 'mozaic/core';
	import { Line, LineEndLabels } from 'mozaic/marks';
	import { AxisX, AxisY, GridY } from 'mozaic/guides';
	import { Scroller } from 'mozaic/interactive';
	import type { ExampleProps } from '../types';
	import { illustrative } from '../common';
	import { messages, steps } from './data';

	let { style, locale, medium = 'web', width }: ExampleProps = $props();

	const t = $derived(messages[locale]);
	const theme = $derived(style);
	const series = [
		{ id: 'capital', values: [100, 104, 108, 113, 118, 106, 115, 124, 131, 138, 146] },
		{ id: 'north', values: [100, 103, 106, 109, 112, 101, 106, 110, 113, 116, 119] },
		{ id: 'south', values: [100, 102, 105, 107, 109, 97, 99, 101, 102, 103, 104] }
	].map((s) => ({ ...s, values: s.values.map((value, i) => ({ year: 2015 + i, value })) }));
	const x = scaleLinear().domain([2015, 2025]);
	const y = scaleLinear().domain([90, 150]);
</script>

{#snippet chart(index: number)}
	{@const step = steps[index]}
	<Chart {style} {locale} {medium} {width}>
		<Header><Title>{t.title}</Title></Header>
		<Plot {x} {y} height={300} padding={{ left: 32, right: 72, top: 8, bottom: 24 }}>
			<Svg>
				<GridY ticks={4} />
				<AxisY ticks={4} />
				<AxisX tickValues={[2015, 2020, 2025]} format={String} />
				{#each series as s, i (s.id)}
					{@const visible = s.values.filter((d) => d.year <= step.until)}
					{@const active = !step.focus || step.focus === s.id}
					<Line
						data={visible}
						x={(d) => d.year}
						y={(d) => d.value}
						stroke={active ? theme.palettes.categorical[i] : theme.palettes.semantic.context}
						strokeWidth={active ? 2.5 : 1.5}
					/>
				{/each}
				<LineEndLabels
					data={series.map((s, i) => ({ s, i, d: s.values.filter((d) => d.year <= step.until).at(-1)! }))}
					x={(e) => e.d.year}
					y={(e) => e.d.value}
					text={(e) => t.names[e.s.id]}
					color={(e) =>
						!step.focus || step.focus === e.s.id ? theme.palettes.categorical[e.i] : theme.palettes.semantic.context}
				/>
			</Svg>
		</Plot>
		<Footer>
			<Notes>{illustrative[locale].notes}</Notes>
			<Source>{illustrative[locale].source}</Source>
		</Footer>
	</Chart>
{/snippet}

<Scroller steps={t.steps}>
	{#snippet graphic({ index })}
		<div class="graphic">{@render chart(index)}</div>
	{/snippet}
	{#snippet step(text)}<p>{text}</p>{/snippet}
</Scroller>

<style>
	.graphic {
		width: min(640px, 100%);
		padding: 16px;
		box-sizing: border-box;
		background: #fff;
	}
</style>
