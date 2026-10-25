<!--
@component
An invisible rectangle over the plot area (inside `<Svg>`) that reports the
pointer position in plot pixels. Invert it with your scales to find the
nearest datum. Works with mouse, pen and touch.
-->
<script lang="ts">
	import { usePlot } from '../core/context.js';

	export type PointerPosition = { x: number; y: number; event: PointerEvent };

	interface Props {
		onmove?: (position: PointerPosition) => void;
		onleave?: (event: PointerEvent) => void;
		class?: string;
	}

	let { onmove, onleave, class: className = '' }: Props = $props();

	const plot = usePlot();

	function report(event: PointerEvent) {
		const rect = (event.currentTarget as SVGRectElement).getBoundingClientRect();
		// The SVG may be scaled (before it is measured), so convert screen px to plot px.
		const sx = rect.width ? plot.width / rect.width : 1;
		const sy = rect.height ? plot.height / rect.height : 1;
		onmove?.({ x: (event.clientX - rect.left) * sx, y: (event.clientY - rect.top) * sy, event });
	}
</script>

{#if plot.medium !== 'print'}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<rect
		class="mz-pointer-area {className}"
		width={plot.width}
		height={plot.height}
		fill="transparent"
		onpointermove={report}
		onpointerdown={report}
		onpointerleave={(e) => onleave?.(e)}
	/>
{/if}

<style>
	.mz-pointer-area {
		pointer-events: all;
		touch-action: pan-y;
	}
</style>
