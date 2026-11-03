<script lang="ts">
	import { scaleSqrt } from 'd3-scale';
	import { max } from 'd3-array';
	import { geoConicConformal } from 'd3-geo';
	import { Chart, Header, Title, Subtitle, Footer, Notes, Source } from '@samizdata/mozaic/frame';
	import { Plot, Svg, Html, position } from '@samizdata/mozaic/core';
	import { GeoPath, Points } from '@samizdata/mozaic/marks';
	import { SizeLegend } from '@samizdata/mozaic/guides';
	import { Tooltip } from '@samizdata/mozaic/interactive';
	import { createLocale } from '@samizdata/mozaic/locale';
	import type { ExampleProps } from '../types';
	import { illustrative } from '../common';
	import { displayName } from '../raion-map/data';
	import { messages, outline, raions, symbols } from './data';

	let { style, locale, medium = 'web', width }: ExampleProps = $props();

	const t = $derived(messages[locale]);
	const fmt = $derived(createLocale(locale));
	const theme = $derived(style);
	const projection = geoConicConformal().parallels([46, 48]).rotate([-28.5, 0]);
	// Area-true circles: radius grows with the square root of the count.
	const r = scaleSqrt()
		.domain([0, max(symbols, (d) => d.count) ?? 1])
		.range([0, 36]);
	// Largest first, so small circles are drawn on top.
	const ordered = symbols.toSorted((a, b) => b.count - a.count);
	let hovered = $state<(typeof symbols)[number] | null>(null);
</script>

<Chart {style} {locale} {medium} {width} alt={t.alt}>
	<Header>
		<Title>{t.title}</Title>
		<Subtitle>{t.subtitle}</Subtitle>
		<SizeLegend scale={r} values={[1000, 5000, 15000]} title={t.legend} />
	</Header>

	<Plot
		{projection}
		fit={outline}
		height={({ width: w }) => Math.min(w * 1.2, 560)}
		padding={{ top: 0, right: 0, bottom: 0, left: 0 }}
	>
		{#snippet children(plot)}
			<Svg>
				<GeoPath data={raions} fill="var(--mz-color-grid)" stroke="var(--mz-color-bg)" />
				<Points
					data={ordered}
					x={(d) => d.lon}
					y={(d) => d.lat}
					r={(d) => r(d.count)}
					fill={theme.palettes.categorical[0]}
					opacity={(d) => (hovered && hovered !== d ? 0.35 : 0.7)}
					onpointerenter={(d) => (hovered = d)}
					onpointerleave={() => (hovered = null)}
				/>
			</Svg>
			<Html>
				{#if hovered}
					{@const [px, py] = position(plot, hovered.lon, hovered.lat)}
					<Tooltip x={px} y={py}
						><strong>{displayName(hovered.id, locale)}</strong><br />{fmt.number(hovered.count)} {t.unit}</Tooltip
					>
				{/if}
			</Html>
		{/snippet}
	</Plot>

	<Footer>
		<Notes>{illustrative[locale].notes}</Notes>
		<Source>{illustrative[locale].source}; geoBoundaries (UNHCR, OCHA), CC BY 3.0 IGO</Source>
	</Footer>
</Chart>
