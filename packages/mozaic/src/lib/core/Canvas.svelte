<!--
@component
A canvas layer over the plot area for very large datasets (thousands of
points), where SVG gets slow. `draw` runs whenever anything it reads from
the plot changes; the context is already scaled for high-DPI screens and
translated to plot-area coordinates. Canvas content does not print: draw an
SVG fallback when `plot.medium === 'print'`.

```svelte
<Canvas draw={(ctx, plot) => { for (const d of data) { ctx.fillRect(plot.x(d.x), plot.y(d.y), 2, 2); } }} />
```
-->
<script lang="ts">
	import { usePlot } from './context.js';
	import type { PlotContext } from './types.js';

	interface Props {
		draw: (ctx: CanvasRenderingContext2D, plot: PlotContext) => void;
		class?: string;
	}

	let { draw, class: className = '' }: Props = $props();

	const plot = usePlot();
	let canvas = $state<HTMLCanvasElement>();

	$effect(() => {
		if (!canvas) return;
		const dpr = window.devicePixelRatio || 1;
		canvas.width = Math.round(plot.width * dpr);
		canvas.height = Math.round(plot.height * dpr);
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, plot.width, plot.height);
		draw(ctx, plot);
	});
</script>

<canvas
	bind:this={canvas}
	class="mz-layer mz-canvas {className}"
	aria-hidden="true"
	style:left="{plot.padding.left}px"
	style:top="{plot.padding.top}px"
	style:width="{plot.width}px"
	style:height="{plot.height}px"
></canvas>

<style>
	.mz-canvas {
		position: absolute;
		pointer-events: none;
	}
</style>
