<!--
@component
Recipe: the footprints of several events on one map (the area each earthquake shook hard, each
flood covered or each fire burnt), stacked from the oldest, faintest, to the newest, strongest,
in one colour. Each footprint is outlined and labelled where you place its label; at narrow
widths, or for footprints without a label position, a key lists them instead. Pointing at the
map lists the footprints that cover that spot. Build footprints from point measurements with
`contourPoints` from `@samizdata/mozaic/transforms`. Use it as is, or run
`mozaic eject FootprintMap` to copy this file into your project and change anything.
-->
<script lang="ts" module>
	/** A labelled point on the map: a town, an epicentre, a country name. */
	export interface FootprintPlace {
		name: string;
		lon: number;
		lat: number;
		/** Draw a dot at the point (towns); without it the name is centred on the point (regions). */
		dot?: boolean;
		/** Grey text, for context such as country names. */
		muted?: boolean;
		/** Text anchor for names beside a dot; defaults to `start` (to the right). */
		anchor?: 'start' | 'middle' | 'end';
		/** Hide at narrow widths. */
		hideSmall?: boolean;
	}
</script>

<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import { geoContains, type GeoPermissibleObjects, type GeoProjection } from 'd3-geo';
	import { Chart, Header, Title, Subtitle, Footer, Source, Notes, type SourceItem } from '../frame/index.js';
	import type { ChartEmbed } from '../embed/index.js';
	import { Plot, Svg, Html, type PlotContext } from '../core/index.js';
	import { Text } from '../marks/index.js';
	import { Legend } from '../guides/index.js';
	import { PointerArea, Tooltip } from '../interactive/index.js';
	import type { LocaleCode } from '../locale/index.js';
	import { base, readableColor, type Breakpoint, type Medium, type Theme } from '../styles/index.js';

	interface Props {
		/** One row per footprint. */
		data: T[];
		/** The footprint's area, e.g. a GeoJSON feature. */
		geometry: (d: T) => GeoPermissibleObjects;
		/** Name of the footprint, e.g. the year. */
		label: (d: T) => string;
		/** What decides the fading: lowest is drawn first and faintest. Defaults to data order (oldest first). */
		order?: (d: T) => number | Date;
		/**
		 * Where to write the footprint's name, as [longitude, latitude]: inside it, near its edge, or
		 * outside it, in empty space, where a leader line joins it to the nearest point of the edge.
		 * Footprints without one go in the key.
		 */
		labelAt?: (d: T) => [number, number] | null | undefined;
		/** Text anchor of each label; defaults to `middle`. */
		labelAnchor?: (d: T) => 'start' | 'middle' | 'end';
		/**
		 * Keep the labels on the map at narrow widths (and in narrow print sizes) as well as listing
		 * the footprints in the key. Without it, narrow maps rely on the key and the tooltip, which
		 * print doesn't have. Defaults to true.
		 */
		labelSmall?: boolean;
		/** Land for context, drawn in grey under the footprints (countries, regions). */
		basemap?: GeoPermissibleObjects[];
		/** Areas the chart is about, outlined on top of the footprints (e.g. the country). */
		focus?: GeoPermissibleObjects[];
		/** Towns, epicentres and region names. */
		places?: FootprintPlace[];
		/** A d3-geo projection; it is fitted to `fit`. */
		projection: GeoProjection;
		/** The area to show; footprints beyond it are cut off. */
		fit: GeoPermissibleObjects;
		/** Width ÷ height of the map. Defaults to 1.1. */
		aspectRatio?: number;
		/** Map height in px, or a function of the width and breakpoint; overrides `aspectRatio`. */
		height?: number | ((size: { width: number; breakpoint: Breakpoint }) => number);
		/** Colour of every footprint; defaults to the first categorical colour. */
		color?: string;
		/** Fill opacity of the oldest and the newest footprint. Defaults to [0.12, 0.4]. */
		opacity?: [number, number];
		/** Tooltip heading over the footprints under the pointer, e.g. "Shaken at intensity VII or more in". */
		tooltipTitle?: string;
		/** Tooltip text where no footprint covers the pointer; with none, no tooltip shows there. */
		tooltipNone?: string;
		style?: Theme;
		locale?: LocaleCode;
		medium?: Medium;
		width?: number;
		title?: string;
		subtitle?: string;
		notes?: string;
		/** Plain text, or sources with optional links (see `<Source>`). */
		source?: string | SourceItem[];
		alt?: string;
		/** The chart's embed page, for the embed code under the chart (see `<Chart embed>`). */
		embed?: ChartEmbed;
		/** Extra SVG drawn on top (annotations); receives the plot context. */
		annotations?: Snippet<[PlotContext]>;
	}

	let {
		data,
		geometry,
		label,
		order,
		labelAt,
		labelAnchor,
		labelSmall = true,
		basemap = [],
		focus = [],
		places = [],
		projection,
		fit,
		aspectRatio = 1.1,
		height,
		color,
		opacity = [0.12, 0.4],
		tooltipTitle,
		tooltipNone,
		style = base,
		locale,
		medium,
		width,
		title,
		subtitle,
		notes,
		source,
		alt,
		embed,
		annotations
	}: Props = $props();

	const uid = $props.id();
	const theme = $derived(style);
	const bg = $derived(theme.tokens['--mz-color-bg'] ?? '#ffffff');
	const hue = $derived(color ?? theme.palettes.categorical[0]);
	const ink = $derived(readableColor(hue, bg));

	/** Oldest first, so the newest is drawn on top. */
	const layers = $derived.by(() => {
		const rows = order ? data.toSorted((a, b) => +order(a) - +order(b)) : [...data];
		const n = rows.length;
		return rows.map((d, i) => {
			const t = n > 1 ? i / (n - 1) : 1;
			const fill = opacity[0] + t * (opacity[1] - opacity[0]);
			return { d, geo: geometry(d), name: label(d), fill, stroke: 0.5 + 0.5 * t, at: labelAt?.(d) ?? null };
		});
	});

	/** Every vertex of a GeoJSON object. */
	function vertices(g: unknown, out: [number, number][] = []): [number, number][] {
		if (!g || typeof g !== 'object') return out;
		const o = g as {
			type?: string;
			coordinates?: unknown;
			geometry?: unknown;
			features?: unknown[];
			geometries?: unknown[];
		};
		if (o.type === 'Feature') return vertices(o.geometry, out);
		if (o.type === 'FeatureCollection') o.features?.forEach((f) => vertices(f, out));
		else if (o.type === 'GeometryCollection') o.geometries?.forEach((f) => vertices(f, out));
		else if (o.coordinates) {
			const walk = (c: unknown) => {
				if (Array.isArray(c) && typeof c[0] === 'number') out.push([c[0], c[1] as number]);
				else if (Array.isArray(c)) c.forEach(walk);
			};
			walk(o.coordinates);
		}
		return out;
	}

	/**
	 * A label placed outside its footprint gets a leader line to the nearest visible point of the
	 * footprint's edge, so labels can sit in empty space when footprints overlap.
	 */
	function leader(l: (typeof layers)[number], plot: PlotContext): [number, number, number, number] | null {
		if (!l.at || !plot.projection || geoContains(l.geo, l.at)) return null;
		const from = plot.projection(l.at);
		if (!from) return null;
		let best: [number, number] | null = null;
		let dist = Infinity;
		for (const v of vertices(l.geo)) {
			const p = plot.projection(v);
			if (!p || p[0] < 0 || p[1] < 0 || p[0] > plot.width || p[1] > plot.height) continue;
			const dd = (p[0] - from[0]) ** 2 + (p[1] - from[1]) ** 2;
			if (dd < dist) {
				dist = dd;
				best = [p[0], p[1]];
			}
		}
		return best ? [from[0], from[1], best[0], best[1]] : null;
	}

	/** The colour a footprint's fill shows over the background, for the key and tooltip swatches. */
	function over(alpha: number): string {
		const rgb = (h: string) => {
			const s = h.replace('#', '');
			const f = s.length === 3 ? s.replace(/./g, '$&$&') : s.slice(0, 6);
			return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16));
		};
		const [a, b] = [rgb(hue), rgb(bg)];
		// Swatches are small, so show them a little stronger than the fill.
		const k = Math.min(1, alpha * 1.6);
		return `#${a
			.map((v, i) =>
				Math.round(k * v + (1 - k) * b[i])
					.toString(16)
					.padStart(2, '0')
			)
			.join('')}`;
	}

	const newestFirst = $derived(layers.toReversed());
	const unlabelled = $derived(layers.some((l) => !l.at));

	let hover = $state<{ x: number; y: number; covered: typeof layers } | null>(null);
	function onmove(px: number, py: number, plot: PlotContext) {
		const lonlat = plot.projection?.invert?.([px, py]);
		if (!lonlat) return (hover = null);
		hover = { x: px, y: py, covered: newestFirst.filter((l) => geoContains(l.geo, lonlat)) };
	}
	const isHovered = (l: (typeof layers)[number]) => !!hover?.covered.includes(l);
</script>

<Chart {style} {locale} {medium} {width} {alt} {embed}>
	<Header>
		{#if title}<Title>{title}</Title>{/if}
		{#if subtitle}<Subtitle>{subtitle}</Subtitle>{/if}
		<!-- The key shows when a footprint has no label on the map, and at narrow widths, where it explains the fading. -->
		<div class="mz-footprint-key" class:mz-footprint-key-always={unlabelled}>
			<Legend items={newestFirst.map((l) => ({ label: l.name, color: over(l.fill) }))} />
		</div>
	</Header>

	<Plot {projection} {fit} {aspectRatio} {height} padding={{ top: 0, right: 0, bottom: 0, left: 0 }}>
		{#snippet children(plot)}
			<Svg>
				{#snippet defs()}
					<clipPath id="mz-footprint-clip-{uid}">
						<rect x={0} y={0} width={plot.width} height={plot.height} />
					</clipPath>
				{/snippet}
				<g class="mz-footprint-map" clip-path="url(#mz-footprint-clip-{uid})">
					{#each basemap as g, i (i)}
						<path
							class="mz-footprint-base"
							d={plot.path?.(g) ?? ''}
							fill="var(--mz-color-grid)"
							fill-opacity="0.45"
							stroke="var(--mz-color-axis)"
							stroke-width="0.5"
							stroke-linejoin="round"
						/>
					{/each}
					{#each layers as l, i (i)}
						<path
							class="mz-footprint"
							d={plot.path?.(l.geo) ?? ''}
							fill={hue}
							fill-opacity={l.fill}
							stroke={hue}
							stroke-opacity={isHovered(l) ? 1 : l.stroke}
							stroke-width={isHovered(l) ? 2.5 : 1.25}
							stroke-linejoin="round"
						/>
					{/each}
					{#each focus as g, i (i)}
						<path
							class="mz-footprint-focus"
							d={plot.path?.(g) ?? ''}
							fill="none"
							stroke="var(--mz-color-text)"
							stroke-width="1.25"
							stroke-linejoin="round"
						/>
					{/each}
				</g>
				{#each places.filter((p) => p.dot && !(p.hideSmall && plot.breakpoint === 's')) as p, i (i)}
					{@const xy = plot.projection?.([p.lon, p.lat])}
					{#if xy}
						<circle
							class="mz-footprint-dot"
							cx={xy[0]}
							cy={xy[1]}
							r={2.5}
							fill={p.muted ? 'var(--mz-color-muted)' : 'var(--mz-color-text)'}
							stroke="var(--mz-color-bg)"
							stroke-width="1"
						/>
					{/if}
				{/each}
				{#each places.filter((p) => !(p.hideSmall && plot.breakpoint === 's')) as p, i (i)}
					{@const anchor = p.dot ? (p.anchor ?? 'start') : 'middle'}
					<Text
						data={[p]}
						x={(d) => d.lon}
						y={(d) => d.lat}
						text={(d) => d.name}
						dx={p.dot ? (anchor === 'start' ? 5 : anchor === 'end' ? -5 : 0) : 0}
						dy={p.dot && anchor === 'middle' ? -9 : 0}
						{anchor}
						fill={p.muted ? 'var(--mz-color-muted)' : 'var(--mz-color-text)'}
						fontWeight={p.dot ? 400 : 600}
						halo
					/>
				{/each}
				{#if plot.breakpoint !== 's' || labelSmall}
					{#each layers.filter((l) => l.at) as l, i (i)}
						{@const line = leader(l, plot)}
						{#if line}
							<g class="mz-footprint-leader">
								<line x1={line[0]} y1={line[1]} x2={line[2]} y2={line[3]} stroke={ink} stroke-width="1" />
								<circle cx={line[2]} cy={line[3]} r="2" fill={ink} />
							</g>
						{/if}
					{/each}
					{#each layers.filter((l) => l.at) as l, i (i)}
						<Text
							data={[l]}
							x={(d) => d.at![0]}
							y={(d) => d.at![1]}
							text={(d) => d.name}
							anchor={labelAnchor?.(l.d) ?? 'middle'}
							fill={ink}
							fontWeight={700}
							halo
						/>
					{/each}
				{/if}
				{@render annotations?.(plot)}
				{#if tooltipTitle}
					<PointerArea onmove={({ x, y }) => onmove(x, y, plot)} onleave={() => (hover = null)} />
				{/if}
			</Svg>
			<Html>
				{#if hover && tooltipTitle && (hover.covered.length || tooltipNone)}
					<Tooltip
						x={hover.x}
						y={hover.y}
						title={tooltipTitle}
						items={hover.covered.length
							? hover.covered.map((l) => ({ label: l.name, value: '', color: over(l.fill), shape: 'square' as const }))
							: [{ label: tooltipNone ?? '', value: '', color: 'transparent', shape: 'square' as const }]}
					/>
				{/if}
			</Html>
		{/snippet}
	</Plot>

	{#if notes || source}
		<Footer>
			{#if notes}<Notes>{notes}</Notes>{/if}
			{#if source}<Source sources={source} />{/if}
		</Footer>
	{/if}
</Chart>

<style>
	.mz-footprint-key {
		display: none;
		margin-top: 0.25rem;
	}
	.mz-footprint-key-always,
	:global([data-mz-breakpoint='s']) .mz-footprint-key {
		display: block;
	}
</style>
