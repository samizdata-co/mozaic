<script lang="ts">
	import { Chart, Header, Title, Subtitle, Footer, Notes, Source } from 'mozaic/frame';
	import { Plot, Svg, Html } from 'mozaic/core';
	import { Hemicycle } from 'mozaic/marks';
	import { Legend } from 'mozaic/guides';
	import { Tooltip } from 'mozaic/interactive';
	import { createLocale } from 'mozaic/locale';
	import type { ExampleProps } from '../types';
	import { illustrative } from '../common';
	import { messages, parties, total, type Party } from './data';

	let { style, locale, medium = 'web', width }: ExampleProps = $props();

	const t = $derived(messages[locale]);
	const fmt = $derived(createLocale(locale));
	const theme = $derived(style);
	// Colour follows the party, in palette order.
	const color = $derived(Object.fromEntries(parties.map((p, i) => [p.id, theme.palettes.categorical[i]])));

	let hover = $state<Party | null>(null);
</script>

<Chart {style} {locale} {medium} {width} alt={t.alt}>
	<Header>
		<Title>{t.title}</Title>
		<Subtitle>{t.subtitle}</Subtitle>
		<Legend items={parties.map((p) => ({ label: `${t.parties[p.id]} ${p.seats}`, color: color[p.id] }))} />
	</Header>

	<Plot height={({ width: w }) => Math.min(w / 2, 300) + 24} padding={{ top: 0, right: 0, bottom: 4, left: 0 }}>
		{#snippet children(plot)}
			<Svg>
				<Hemicycle
					data={parties}
					value={(p) => p.seats}
					fill={(p) => color[p.id]}
					opacity={(p) => (hover && hover !== p ? 0.35 : 1)}
					majorityLine
					majorityLabel={t.majority}
					title={(p) => `${t.parties[p.id]}: ${p.seats} ${t.seats}`}
					onpointerenter={(p) => (hover = p)}
					onpointerleave={() => (hover = null)}
				>
					{#snippet center(g)}
						<text class="total" x={g.cx} y={g.cy - 22} text-anchor="middle">{total}</text>
						<text class="total-label" x={g.cx} y={g.cy - 4} text-anchor="middle">{t.seats}</text>
					{/snippet}
				</Hemicycle>
			</Svg>
			<Html>
				{#if hover}
					<Tooltip x={plot.width / 2} y={plot.height / 2}>
						<strong>{hover.seats} {t.seats}</strong><br />{t.parties[hover.id]} · {fmt.format('.1f')(hover.share)}%
					</Tooltip>
				{/if}
			</Html>
		{/snippet}
	</Plot>

	<Footer>
		<Notes>{illustrative[locale].notes}</Notes>
		<Source>{illustrative[locale].source}</Source>
	</Footer>
</Chart>

<style>
	.total {
		fill: var(--mz-color-text);
		font-family: var(--mz-font-body);
		font-weight: var(--mz-weight-strong);
		font-size: 2rem;
	}
	.total-label {
		fill: var(--mz-color-muted);
		font-family: var(--mz-font-body);
		font-size: var(--mz-size-small);
	}
</style>
