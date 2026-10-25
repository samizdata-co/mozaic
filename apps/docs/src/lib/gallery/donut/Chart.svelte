<script lang="ts">
	import { Chart, Header, Title, Subtitle, Footer, Notes, Source } from 'mozaic/frame';
	import { Plot, Svg } from 'mozaic/core';
	import { Arcs } from 'mozaic/marks';
	import { createLocale } from 'mozaic/locale';
	import { resolveStyle } from 'mozaic/styles';
	import type { ExampleProps } from '../types';
	import { illustrative } from '../common';
	import { messages, rows, type Row } from './data';

	let { style, locale, medium = 'web', width }: ExampleProps = $props();

	const t = $derived(messages[locale]);
	const fmt = $derived(createLocale(locale));
	const theme = $derived(resolveStyle(style));
	const color = $derived<Record<Row['id'], string>>({
		yes: theme.palettes.semantic.positive,
		no: theme.palettes.semantic.negative,
		unsure: theme.palettes.semantic.context
	});
</script>

<Chart {style} {locale} {medium} {width} alt={t.alt}>
	<Header>
		<Title>{t.title}</Title>
		<Subtitle>{t.subtitle}</Subtitle>
	</Header>

	<Plot height={260} padding={{ top: 8, right: 8, bottom: 8, left: 8 }}>
		{#snippet children(plot)}
			<Svg>
				<!-- Direct labels instead of a legend: few slices, each named. -->
				<Arcs
					data={rows}
					value={(d) => d.share}
					fill={(d) => color[d.id]}
					label={(d) => `${t.items[d.id]} ${fmt.percent(d.share)}`}
					title={(d) => t.items[d.id]}
				/>
				<text
					x={plot.width / 2}
					y={plot.height / 2}
					text-anchor="middle"
					dy="0.35em"
					font-size="22"
					font-weight="700"
					fill="var(--mz-color-text)">{fmt.percent(rows[0].share)}</text
				>
			</Svg>
		{/snippet}
	</Plot>

	<Footer>
		<Notes>{illustrative[locale].notes}</Notes>
		<Source>{illustrative[locale].source}</Source>
	</Footer>
</Chart>
