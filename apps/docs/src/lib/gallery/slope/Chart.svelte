<script lang="ts">
	import { scaleLinear } from 'd3-scale';
	import { Chart, Header, Title, Subtitle, Footer, Notes, Source } from 'mozaic/frame';
	import { Plot, Svg } from 'mozaic/core';
	import { Slope } from 'mozaic/marks';
	import { createLocale } from 'mozaic/locale';
	import type { ExampleProps } from '../types';
	import { illustrative } from '../common';
	import { messages, rows } from './data';

	let { style, locale, medium = 'web', width }: ExampleProps = $props();

	const t = $derived(messages[locale]);
	const fmt = $derived(createLocale(locale));
	const theme = $derived(style);
	const y = scaleLinear().domain([0.2, 0.6]);
	// Highlight the exception; everything else in the context grey.
	const color = $derived((d: (typeof rows)[number]) =>
		d.after < d.before ? theme.palettes.semantic.highlight : theme.palettes.semantic.context
	);
</script>

<Chart {style} {locale} {medium} {width} alt={t.alt}>
	<Header>
		<Title>{t.title}</Title>
		<Subtitle>{t.subtitle}</Subtitle>
	</Header>

	<Plot
		{y}
		height={280}
		padding={({ breakpoint }) => ({
			left: breakpoint === 's' ? 96 : 130,
			right: breakpoint === 's' ? 96 : 130,
			top: 28,
			bottom: 8
		})}
	>
		<Svg>
			<Slope
				data={rows}
				start={(d) => d.before}
				end={(d) => d.after}
				label={(d) => t.regions[d.region]}
				{color}
				format={fmt.percent}
				headings={['2019', '2024']}
			/>
		</Svg>
	</Plot>

	<Footer>
		<Notes>{illustrative[locale].notes}</Notes>
		<Source>{illustrative[locale].source}</Source>
	</Footer>
</Chart>
