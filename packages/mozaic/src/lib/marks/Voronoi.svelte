<!--
@component
Invisible hover cells around each point, so the nearest datum is always easy
to hit (scatter plots, line charts with many points). Draw it last in `<Svg>`.
-->
<script lang="ts" generics="T">
	import { Delaunay } from 'd3-delaunay';
	import { usePlot } from '../core/context.js';
	import { position } from '../core/scales.js';
	import { access, type Accessor, type Value } from '../core/accessor.js';

	interface Props {
		data: T[];
		x: Accessor<T, Value>;
		y: Accessor<T, Value>;
		onpointerenter?: (d: T, event: PointerEvent) => void;
		onpointerleave?: (d: T, event: PointerEvent) => void;
		onclick?: (d: T, event: MouseEvent) => void;
		/** Show cell outlines (debugging). */
		debug?: boolean;
		class?: string;
	}

	let { data, x, y, onpointerenter, onpointerleave, onclick, debug = false, class: className = '' }: Props = $props();

	const plot = usePlot();

	const cells = $derived.by(() => {
		const points = data.map((d, i) => position(plot, access(x, d, i), access(y, d, i)));
		const valid = points.map((p, i) => ({ p, i })).filter(({ p }) => Number.isFinite(p[0]) && Number.isFinite(p[1]));
		if (!valid.length || plot.width <= 0 || plot.height <= 0) return [];
		const voronoi = Delaunay.from(valid.map((v) => v.p)).voronoi([0, 0, plot.width, plot.height]);
		return valid.map((v, k) => ({ d: data[v.i], path: voronoi.renderCell(k) }));
	});
</script>

{#if plot.medium !== 'print'}
	<g class="mz-voronoi {className}" class:mz-debug={debug}>
		{#each cells as cell}
			<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
			<path
				d={cell.path}
				onpointerenter={onpointerenter ? (e) => onpointerenter(cell.d, e) : undefined}
				onpointerleave={onpointerleave ? (e) => onpointerleave(cell.d, e) : undefined}
				onclick={onclick ? (e) => onclick(cell.d, e) : undefined}
			/>
		{/each}
	</g>
{/if}

<style>
	.mz-voronoi path {
		fill: transparent;
		stroke: none;
		pointer-events: all;
	}
	.mz-debug path {
		stroke: red;
		stroke-width: 0.5;
	}
</style>
