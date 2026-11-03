<script lang="ts">
	import { Chart, Header, Title, Subtitle, Footer, Notes, Source } from '@samizdata/mozaic/frame';
	import { Plot, Svg, Html } from '@samizdata/mozaic/core';
	import { Treemap } from '@samizdata/mozaic/marks';
	import { Legend } from '@samizdata/mozaic/guides';
	import { Tooltip } from '@samizdata/mozaic/interactive';
	import { createLocale } from '@samizdata/mozaic/locale';
	import { contrastRatio } from '@samizdata/mozaic/styles';
	import type { ExampleProps } from '../types';
	import { illustrative } from '../common';
	import { messages, rows, type Row } from './data';

	let { style, locale, medium = 'web', width }: ExampleProps = $props();

	const t = $derived(messages[locale]);
	const fmt = $derived(createLocale(locale));
	const theme = $derived(style);
	const groups: Row['group'][] = ['social', 'economy', 'state'];
	// White labels sit on the fills, so use the first style colours dark enough for them (≥ 4.5:1),
	// falling back to the dark end of the sequential ramp.
	const fills = $derived(
		[...new Set([...theme.palettes.categorical, ...theme.palettes.sequential.toReversed()])].filter(
			(c) => contrastRatio(c, '#ffffff') >= 4.5
		)
	);
	const color = $derived(Object.fromEntries(groups.map((g, i) => [g, fills[i]])));
	let hovered = $state<{ d: Row; x: number; y: number } | null>(null);
</script>

<Chart {style} {locale} {medium} {width} alt={t.alt}>
	<Header>
		<Title>{t.title}</Title>
		<Subtitle>{t.subtitle}</Subtitle>
		<Legend items={groups.map((g) => ({ label: t.groups[g], color: color[g] }))} />
	</Header>

	<Plot height={({ width: w }) => Math.min(420, w * 0.62)} padding={{ top: 0, right: 0, bottom: 0, left: 0 }}>
		<Svg>
			<Treemap
				data={rows}
				value={(d) => d.value}
				group={(d) => d.group}
				fill={(d) => color[d.group]}
				label={(d) => t.items[d.id]}
				sublabel={(d) => fmt.format(',.1f')(d.value)}
				onpointerenter={(d, _e, cell) => (hovered = { d, x: (cell.x0 + cell.x1) / 2, y: (cell.y0 + cell.y1) / 2 })}
				onpointerleave={() => (hovered = null)}
			/>
		</Svg>
		<Html>
			{#if hovered}
				<Tooltip x={hovered.x} y={hovered.y}>
					<strong>{t.items[hovered.d.id]}</strong><br />{fmt.format(',.1f')(hovered.d.value)}
					{t.unit}
				</Tooltip>
			{/if}
		</Html>
	</Plot>

	<Footer>
		<Notes>{illustrative[locale].notes}</Notes>
		<Source>{illustrative[locale].source}</Source>
	</Footer>
</Chart>
