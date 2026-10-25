<script lang="ts">
	import { scaleThreshold } from 'd3-scale';
	import { geoConicConformal } from 'd3-geo';
	import { Chart, Header, Title, Subtitle, Footer, Source, Notes } from 'mozaic/frame';
	import { Plot, Svg, Html } from 'mozaic/core';
	import { GeoPath } from 'mozaic/marks';
	import { Legend } from 'mozaic/guides';
	import { Tooltip } from 'mozaic/interactive';
	import { createLocale } from 'mozaic/locale';
	import { rampSteps, resolveStyle } from 'mozaic/styles';
	import type { ExampleProps } from '../types';
	import { displayName, messages, outline, raions, type Raion } from './data';

	let { style, locale, medium = 'web', width }: ExampleProps = $props();

	const t = $derived(messages[locale]);
	const fmt = $derived(createLocale(locale));
	const theme = $derived(resolveStyle(style));

	const color = $derived(
		scaleThreshold<number, string>()
			.domain([0.1, 0.2, 0.3, 0.4])
			.range(rampSteps(theme.palettes.sequential, 5, theme.tokens['--mz-color-bg']))
	);
	const fill = (d: Raion) => (d.value === null ? theme.palettes.semantic.context : color(d.value));

	// Conformal conic centred on Moldova; Plot fits it to the plot area.
	const projection = geoConicConformal().parallels([46, 48]).rotate([-28.5, 0]);

	let hovered = $state<Raion | null>(null);
</script>

<Chart {style} {locale} {medium} {width} alt={t.alt}>
	<Header>
		<Title>{t.title}</Title>
		<Subtitle>{t.subtitle}</Subtitle>
		<div class="legends">
			<Legend scale={color} format={fmt.percent} />
			<Legend items={[{ label: t.noData, color: theme.palettes.semantic.context }]} />
		</div>
	</Header>

	<Plot
		{projection}
		fit={outline}
		height={({ width }) => Math.min(width * 1.2, 560)}
		padding={{ top: 0, right: 0, bottom: 0, left: 0 }}
	>
		{#snippet children(plot)}
			<Svg>
				<GeoPath
					data={raions}
					{fill}
					strokeWidth={0.75}
					opacity={(d) => (hovered && hovered.id !== d.id ? 0.7 : 1)}
					onpointerenter={(d) => (hovered = d)}
					onpointerleave={() => (hovered = null)}
				/>
				{#if hovered}
					<path class="highlight" d={plot.path?.(hovered) ?? ''} />
				{/if}
			</Svg>
			<Html>
				{#if hovered && plot.path}
					{@const [cx, cy] = plot.path.centroid(hovered)}
					<Tooltip x={cx} y={cy}>
						<strong>{displayName(hovered.id, locale)}</strong><br />
						{hovered.value === null ? t.noData : fmt.percent(hovered.value)}
					</Tooltip>
				{/if}
			</Html>
		{/snippet}
	</Plot>

	<Footer>
		<Notes>{t.notes}</Notes>
		<Source>{t.source}</Source>
	</Footer>
</Chart>

<style>
	.legends {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 1.25rem;
	}
	.highlight {
		fill: none;
		stroke: var(--mz-color-text);
		stroke-width: 1.5;
		pointer-events: none;
	}
</style>
