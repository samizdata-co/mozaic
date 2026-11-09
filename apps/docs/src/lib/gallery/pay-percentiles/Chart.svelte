<!-- Built with the PercentileChart recipe: a ready-made chart you can also eject and edit. -->
<script lang="ts">
	import { PercentileChart } from '@samizdata/mozaic/recipes';
	import { createLocale } from '@samizdata/mozaic/locale';
	import type { ExampleProps } from '../types';
	import { illustrative } from '../common';
	import { messages, rows, type Row } from './data';

	let { style, locale, medium = 'web', width }: ExampleProps = $props();

	const t = $derived(messages[locale]);
	const fmt = $derived(createLocale(locale));
	// Starts at the nurses' median; the reader changes it with the box, the slider or the strips.
	let pay = $state(14900);
</script>

<PercentileChart
	data={rows}
	label={(d: Row) => t.groups[d.group]}
	percentiles={(d: Row) => d.percentiles}
	highlight={(d: Row) => d.group === 'nurses'}
	bind:value={pay}
	step={100}
	min={0}
	max={40000}
	inputLabel={t.input}
	youLabel={(v) => `${t.you}: ${v}`}
	readoutLabel={t.readout}
	summary={(rank, d) =>
		t.summary(
			`${fmt.format('.0f')(rank.percentile)}%`,
			t.inText[d.group],
			rank.above ? 'above' : rank.below ? 'below' : 'in'
		)}
	medianLabel={t.median}
	middleLabel={t.middle}
	rangeLabel={t.range}
	percentileLabel={t.percentile}
	{style}
	{locale}
	{medium}
	{width}
	title={t.title}
	subtitle={t.subtitle}
	alt={t.alt}
	notes={illustrative[locale].notes}
	source={illustrative[locale].source}
/>
