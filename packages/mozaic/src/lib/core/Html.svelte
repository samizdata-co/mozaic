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
</script>

{#if plot.medium !== 'print'}
	<div
		class="mz-layer mz-html {className}"
		style:left="{plot.padding.left}px"
		style:top="{plot.padding.top}px"
		style:width="{plot.width}px"
		style:height="{plot.height}px"
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
