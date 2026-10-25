<!--
@component
A shaded band between two x values (a period: a recession, a lockdown) or
two y values (a target range), with an optional label. Draw it first in
`<Svg>` so marks sit on top.
-->
<script lang="ts">
	import { usePlot } from '../core/context.js';

	interface Props {
		x1?: unknown;
		x2?: unknown;
		y1?: unknown;
		y2?: unknown;
		label?: string;
		fill?: string;
		opacity?: number;
		class?: string;
	}

	let { x1, x2, y1, y2, label, fill = 'var(--mz-color-grid)', opacity = 0.6, class: className = '' }: Props = $props();

	const plot = usePlot();

	const box = $derived.by(() => {
		const xs = x1 !== undefined && x2 !== undefined ? [plot.x(x1) ?? 0, plot.x(x2) ?? 0] : [0, plot.width];
		const ys = y1 !== undefined && y2 !== undefined ? [plot.y(y1) ?? 0, plot.y(y2) ?? 0] : [0, plot.height];
		return { x: Math.min(...xs), y: Math.min(...ys), width: Math.abs(xs[1] - xs[0]), height: Math.abs(ys[1] - ys[0]) };
	});
</script>

<g class="mz-ref-band {className}">
	<rect x={box.x} y={box.y} width={box.width} height={box.height} style:fill fill-opacity={opacity} />
	{#if label}<text x={box.x + 4} y={box.y + 4} dy="0.9em">{label}</text>{/if}
</g>

<style>
	text {
		fill: var(--mz-color-muted);
		font-size: var(--mz-size-axis);
		font-family: var(--mz-font-label);
		font-weight: var(--mz-weight-label);
		text-transform: var(--mz-label-transform);
		letter-spacing: var(--mz-label-tracking);
	}
</style>
