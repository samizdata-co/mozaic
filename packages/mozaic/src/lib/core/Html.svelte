<!--
@component
An HTML layer positioned exactly over the plot area, for tooltips and other
interactive elements. It ignores pointer events itself; children opt in.
Not rendered in print, and not part of SVG exports.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { usePlot } from './context.js';

	let { class: className = '', children }: { class?: string; children?: Snippet } = $props();

	const plot = usePlot();

	// Before the plot is measured (server render, no JS yet) its size is a guess, so position the
	// layer in percentages of the plot box, which scales with the page instead of overflowing it.
	const x = (px: number) => (plot.measured ? `${px}px` : `${(px / (plot.fullWidth || 1)) * 100}%`);
	const y = (px: number) => (plot.measured ? `${px}px` : `${(px / (plot.fullHeight || 1)) * 100}%`);
</script>

{#if plot.medium !== 'print'}
	<div
		class="mz-layer mz-html {className}"
		style:left={x(plot.padding.left)}
		style:top={y(plot.padding.top)}
		style:width={x(plot.width)}
		style:height={y(plot.height)}
	>
		{@render children?.()}
	</div>
{/if}

<style>
	.mz-html {
		position: absolute;
		pointer-events: none;
	}
</style>
