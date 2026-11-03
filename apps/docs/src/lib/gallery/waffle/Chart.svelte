<script lang="ts">
	import { Chart, Header, Title, Subtitle, Footer, Notes, Source } from '@samizdata/mozaic/frame';
	import { Plot, Svg } from '@samizdata/mozaic/core';
	import { Waffle } from '@samizdata/mozaic/marks';
	import { Legend } from '@samizdata/mozaic/guides';
	import type { ExampleProps } from '../types';
	import { illustrative } from '../common';
	import { messages, rows } from './data';

	let { style, locale, medium = 'web', width }: ExampleProps = $props();

	const t = $derived(messages[locale]);
	const theme = $derived(style);
	// "Neither" is the story: it gets the highlight; the other two get the first categorical colours that differ from it.
	const colors = $derived([
		...theme.palettes.categorical.filter((c) => c !== theme.palettes.semantic.highlight).slice(0, 2),
		theme.palettes.semantic.highlight
	]);
</script>

<Chart {style} {locale} {medium} {width} alt={t.alt}>
	<Header>
		<Title>{t.title}</Title>
		<Subtitle>{t.subtitle}</Subtitle>
		<Legend items={rows.map((d, i) => ({ label: `${t.items[d.id]} (${d.count})`, color: colors[i] }))} />
	</Header>

	<Plot height={({ width: w }) => Math.min(w, 320)} padding={{ top: 0, right: 0, bottom: 0, left: 0 }}>
		<Svg>
			<Waffle
				data={rows}
				value={(d) => d.count}
				fill={(_, i) => colors[i]}
				columns={10}
				title={(d) => `${t.items[d.id]}: ${d.count}`}
			/>
		</Svg>
	</Plot>

	<Footer>
		<Notes>{illustrative[locale].notes}</Notes>
		<Source>{illustrative[locale].source}</Source>
	</Footer>
</Chart>
