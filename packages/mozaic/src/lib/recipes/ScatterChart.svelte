<!--
@component
Recipe: a scatter plot with optional bubble sizes, colour groups, labels for
selected points and a nearest-point tooltip. `mozaic eject ScatterChart`
copies this file into your project.
-->
<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import { scaleLinear, scaleSqrt } from 'd3-scale';
	import { extent, max } from 'd3-array';
	import { Chart, Header, Title, Subtitle, Footer, Source, Notes } from '../frame/index.js';
	import { Plot, Svg, Html, type PlotContext } from '../core/index.js';
	import { Points, Voronoi } from '../marks/index.js';
	import { AxisX, AxisY, GridX, GridY, Legend } from '../guides/index.js';
	import { Label } from '../annotations/index.js';
	import { Tooltip } from '../interactive/index.js';
	import { createLocale, type LocaleCode } from '../locale/index.js';
	import { resolveStyle, type StyleName, type Medium } from '../styles/index.js';

	interface Props {
		data: T[];
		x: (d: T) => number;
		y: (d: T) => number;
		/** Name shown in the tooltip and labels. */
		name: (d: T) => string;
		/** Optional size value (bubble chart). */
		size?: (d: T) => number;
		/** Optional colour group. */
		group?: (d: T) => string;
		/** Points to label permanently. */
		labelled?: (d: T) => boolean;
		style?: StyleName;
		locale?: LocaleCode;
		medium?: Medium;
		width?: number;
		title?: string;
		subtitle?: string;
		notes?: string;
		source?: string;
		alt?: string;
		xLabel?: string;
		yLabel?: string;
		xFormat?: (n: number) => string;
		yFormat?: (n: number) => string;
		height?: number;
		annotations?: Snippet<[PlotContext]>;
	}

	let {
		data,
		x: xValue,
		y: yValue,
		name,
		size,
		group,
		labelled,
		style = 'base',
		locale,
		medium,
		width,
		title,
		subtitle,
		notes,
		source,
		alt,
		xLabel,
		yLabel,
		xFormat,
		yFormat,
		height = 360,
		annotations
	}: Props = $props();

	const theme = $derived(resolveStyle(style));
	const loc = $derived(createLocale(locale ?? theme.defaultLocale));
	const x = $derived(
		scaleLinear()
			.domain(extent(data, xValue) as [number, number])
			.nice()
	);
	const y = $derived(
		scaleLinear()
			.domain(extent(data, yValue) as [number, number])
			.nice()
	);
	const r = $derived(
		size
			? scaleSqrt()
					.domain([0, max(data, size) ?? 1])
					.range([0, 18])
			: () => 5
	);
	const groups = $derived(group ? [...new Set(data.map(group))] : []);
	const colour = (d: T) =>
		group
			? theme.palettes.categorical[groups.indexOf(group(d)) % theme.palettes.categorical.length]
			: theme.palettes.categorical[0];
	let hovered = $state<T | null>(null);
</script>

<Chart {style} {locale} {medium} {width} {alt}>
	<Header>
		{#if title}<Title>{title}</Title>{/if}
		{#if subtitle}<Subtitle>{subtitle}</Subtitle>{/if}
		{#if groups.length > 1}
			<Legend
				shape="circle"
				items={groups.map((g, i) => ({
					label: g,
					color: theme.palettes.categorical[i % theme.palettes.categorical.length]
				}))}
			/>
		{/if}
	</Header>

	<Plot {x} {y} {height} padding={{ left: 44, right: 16, top: 16, bottom: 36 }}>
		{#snippet children(plot)}
			<Svg>
				<GridX ticks={5} />
				<GridY ticks={5} />
				<AxisX ticks={5} format={xFormat} label={xLabel} />
				<AxisY ticks={5} format={yFormat} label={yLabel} />
				<Points
					{data}
					x={xValue}
					y={yValue}
					r={(d) => (size ? r(size(d)) : 5)}
					fill={colour}
					opacity={(d) => (hovered && hovered !== d ? 0.35 : size ? 0.75 : 0.9)}
				/>
				{#if labelled}
					{#each data.filter(labelled) as d}
						<Label x={xValue(d)} y={yValue(d)} label={name(d)} dx={(size ? r(size(d)) : 5) + 4} />
					{/each}
				{/if}
				{@render annotations?.(plot)}
				<Voronoi
					{data}
					x={xValue}
					y={yValue}
					onpointerenter={(d) => (hovered = d)}
					onpointerleave={() => (hovered = null)}
				/>
			</Svg>
			<Html>
				{#if hovered}
					<Tooltip x={plot.x(xValue(hovered)) ?? 0} y={plot.y(yValue(hovered)) ?? 0}>
						<strong>{name(hovered)}</strong><br />
						{xLabel ?? 'x'}: {(xFormat ?? loc.number)(xValue(hovered))}<br />
						{yLabel ?? 'y'}: {(yFormat ?? loc.number)(yValue(hovered))}
					</Tooltip>
				{/if}
			</Html>
		{/snippet}
	</Plot>

	{#if notes || source}
		<Footer>
			{#if notes}<Notes>{notes}</Notes>{/if}
			{#if source}<Source>{source}</Source>{/if}
		</Footer>
	{/if}
</Chart>
