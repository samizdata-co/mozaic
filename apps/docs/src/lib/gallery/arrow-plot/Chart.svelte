<!-- Built with the ArrowChart recipe: a ready-made chart you can also eject and edit. -->
<script lang="ts">
	import { ArrowChart } from '@samizdata/mozaic/recipes';
	import type { ExampleProps } from '../types';
	import { illustrative } from '../common';
	import { messages, rows, type Row } from './data';

	let { style, locale, medium = 'web', width }: ExampleProps = $props();

	const t = $derived(messages[locale]);
	const theme = $derived(style);
	// The president stands out; the other rows recede.
	const color = $derived((d: Row) =>
		d.institution === 'president' ? theme.palettes.categorical[0] : theme.palettes.semantic.context
	);
</script>

<ArrowChart
	data={rows}
	label={(d: Row) => t.institutions[d.institution]}
	start={(d: Row) => d.before}
	end={(d: Row) => d.after}
	startLabel={t.start}
	endLabel={t.end}
	sort="end"
	domain={[0, 100]}
	format={(n) => `${n}%`}
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
