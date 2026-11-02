<!--
@component
A tooltip card at a pixel position in the plot area (inside `<Html>`).
Flips to the left of the point in the right part of the plot, and changes side or
slides over when needed to stay inside the chart.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { usePlot } from '../core/context.js';
	import { tooltipLeft } from './tooltip-position.js';

	interface Props {
		/** Plot-area pixel position. */
		x: number;
		y: number;
		visible?: boolean;
		/** Distance from the point, px. */
		offset?: number;
		class?: string;
		children?: Snippet;
	}

	let { x, y, visible = true, offset = 12, class: className = '', children }: Props = $props();

	const plot = usePlot();
	const flip = $derived(x > plot.width * 0.6);
	const top = $derived(Math.max(0, Math.min(plot.height, y)));
	// Once measured, the tooltip is placed so it stays inside the chart (see tooltipLeft).
	let tooltipWidth = $state(0);
	const left = $derived(tooltipWidth ? tooltipLeft(x, tooltipWidth, plot, offset) : null);
</script>

{#if visible && plot.medium !== 'print'}
	<div
		class="mz-tooltip {className}"
		role="status"
		style:left="{left ?? x}px"
		style:top="{top}px"
		style:transform={left !== null
			? 'translate(0, -50%)'
			: flip
				? `translate(calc(-100% - ${offset}px), -50%)`
				: `translate(${offset}px, -50%)`}
		bind:offsetWidth={tooltipWidth}
	>
		{@render children?.()}
	</div>
{/if}

<style>
	.mz-tooltip {
		position: absolute;
		z-index: 1;
		min-width: 6rem;
		max-width: 16rem;
		padding: 0.5rem 0.625rem;
		background: var(--mz-color-tooltip-bg);
		border: 1px solid var(--mz-color-border);
		border-radius: var(--mz-radius-floating);
		box-shadow: var(--mz-shadow-floating);
		font-size: var(--mz-size-small);
		line-height: 1.35;
		color: var(--mz-color-text);
		pointer-events: none;
	}
</style>
