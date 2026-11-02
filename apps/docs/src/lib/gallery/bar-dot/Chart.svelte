<!-- Built with the BarDotChart recipe: a ready-made chart you can also eject and edit. -->
<script lang="ts">
	import { BarDotChart } from 'mozaic/recipes';
	import { createLocale } from 'mozaic/locale';
	import { resolveStyle } from 'mozaic/styles';
	import type { ExampleProps } from '../types';
	import { illustrative } from '../common';
	import { messages, rows, type Row } from './data';

	let { style, locale, medium = 'web', width }: ExampleProps = $props();

	const t = $derived(messages[locale]);
	const fmt = $derived(createLocale(locale));
	const theme = $derived(resolveStyle(style));
	// "Don't know" is not an issue: grey, and kept last (the rows are in display order, so no sort).
	// Other bars keep the recipe's default, the middle sequential step.
	const bar = $derived(theme.palettes.sequential[Math.floor(theme.palettes.sequential.length / 2)]);
	const color = $derived((d: Row) => (d.worry === 'dontKnow' ? theme.palettes.semantic.context : bar));
</script>

<BarDotChart
	data={rows}
	label={(d: Row) => t.worries[d.worry]}
	value={(d: Row) => d.autumn}
	previous={(d: Row) => d.spring}
	valueLabel={t.autumn}
	previousLabel={t.spring}
	format={(n) => `${fmt.format('.1f')(n)}%`}
	tickFormat={(n) => `${n}%`}
	{color}
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
