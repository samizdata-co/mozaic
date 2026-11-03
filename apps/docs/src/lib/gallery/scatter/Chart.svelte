<!-- Built with the ScatterChart recipe: a ready-made chart you can also eject and edit. -->
<script lang="ts">
	import { ScatterChart } from '@samizdata/mozaic/recipes';
	import { RefLine } from '@samizdata/mozaic/annotations';
	import { createLocale } from '@samizdata/mozaic/locale';
	import type { ExampleProps } from '../types';
	import { illustrative } from '../common';
	import { districts, messages, type District } from './data';

	let { style, locale, medium = 'web', width }: ExampleProps = $props();

	const t = $derived(messages[locale]);
	const fmt = $derived(createLocale(locale));
	const average = districts.reduce((sum, d) => sum + d.income, 0) / districts.length;
</script>

<ScatterChart
	data={districts}
	x={(d: District) => d.distance}
	y={(d: District) => d.income}
	name={(d: District) => d.name}
	size={(d: District) => d.population}
	group={(d: District) => t.regions[d.region]}
	labelled={(d: District) => ['Bălți', 'Ialoveni', 'Briceni', 'Cahul'].includes(d.name)}
	{style}
	{locale}
	{medium}
	{width}
	title={t.title}
	subtitle={t.subtitle}
	alt={t.alt}
	xLabel={t.x}
	yLabel={t.y}
	yFormat={fmt.number}
	notes={illustrative[locale].notes}
	source={illustrative[locale].source}
>
	{#snippet annotations()}
		<RefLine y={average} label="⌀ {fmt.number(Math.round(average))}" />
	{/snippet}
</ScatterChart>
