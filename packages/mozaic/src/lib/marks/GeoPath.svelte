<!--
@component
GeoJSON features drawn with the plot's projection. Needs `projection` on `<Plot>`.
Features are separated by a thin stroke in the background colour.
-->
<script lang="ts" generics="T">
	import type { GeoPermissibleObjects } from 'd3-geo';
	import { usePlot } from '../core/context.js';
	import { access, type Accessor } from '../core/accessor.js';

	interface Props {
		data: T[];
		/** The geometry to draw; defaults to the datum itself (a GeoJSON feature). */
		geometry?: (d: T) => GeoPermissibleObjects;
		fill?: Accessor<T, string>;
		stroke?: Accessor<T, string>;
		strokeWidth?: number;
		opacity?: Accessor<T, number>;
		onpointerenter?: (d: T, event: PointerEvent) => void;
		onpointerleave?: (d: T, event: PointerEvent) => void;
		onclick?: (d: T, event: MouseEvent) => void;
		class?: string;
	}

	let {
		data,
		geometry = (d) => d as GeoPermissibleObjects,
		fill = 'none',
		stroke = 'var(--mz-color-bg)',
		strokeWidth = 0.75,
		opacity = 1,
		onpointerenter,
		onpointerleave,
		onclick,
		class: className = ''
	}: Props = $props();

	const plot = usePlot();
	if (!plot.projection) console.warn('<GeoPath> needs a `projection` on its <Plot>.');
</script>

<g class="mz-geo {className}" stroke-width={strokeWidth}>
	{#each data as d, i}
		<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
		<path
			d={plot.path?.(geometry(d)) ?? ''}
			fill={access(fill, d, i)}
			fill-opacity={access(opacity, d, i)}
			style:stroke={access(stroke, d, i)}
			stroke-linejoin="round"
			onpointerenter={onpointerenter ? (e) => onpointerenter(d, e) : undefined}
			onpointerleave={onpointerleave ? (e) => onpointerleave(d, e) : undefined}
			onclick={onclick ? (e) => onclick(d, e) : undefined}
		/>
	{/each}
</g>
