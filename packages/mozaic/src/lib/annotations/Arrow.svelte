<!--
@component
A curved arrow between two data points, without a label. Use with `<Text>`
when the label needs custom placement; otherwise prefer `<Callout>`.
-->
<script lang="ts">
	import { usePlot } from '../core/context.js';
	import { position } from '../core/scales.js';
	import { calloutGeometry } from './callout-geometry.js';

	interface Props {
		/** Start point in data space. */
		from: [unknown, unknown];
		/** End point (arrowhead) in data space. */
		to: [unknown, unknown];
		/** Pixel offsets applied to the start point. */
		dx?: number;
		dy?: number;
		curve?: 'left' | 'right' | 'none' | number;
		class?: string;
	}

	let { from, to, dx = 0, dy = 0, curve = 'right', class: className = '' }: Props = $props();

	const plot = usePlot();
	const bend = $derived(curve === 'right' ? 0.3 : curve === 'left' ? -0.3 : curve === 'none' ? 0 : curve);
	const geometry = $derived.by(() => {
		const [sx, sy] = position(plot, from[0], from[1]);
		const [tx, ty] = position(plot, to[0], to[1]);
		const lx = sx + dx;
		const ly = sy + dy;
		// A zero-size "label" at the start point, so the arrow starts exactly there.
		return calloutGeometry({ tx, ty, lx, ly, top: ly, bottom: ly, anchor: 'middle', bend, gap: 0 });
	});
</script>

<g class="mz-arrow {className}">
	<path d={geometry.arrow} />
	<path d={geometry.head} />
</g>

<style>
	path {
		fill: none;
		stroke: var(--mz-color-text);
		stroke-width: 1;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
</style>
