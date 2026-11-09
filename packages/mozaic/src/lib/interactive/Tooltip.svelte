<!--
@component
A tooltip card at a pixel position in the plot area (inside `<Html>`).
Flips to the left of the point in the right part of the plot, and changes side or
slides over when needed to stay inside the chart. Pass `title` and `items` for the
usual card: a heading, then one row per series with its colour, name and value,
values aligned in a column. `children` follow the rows.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { usePlot } from '../core/context.js';
	import { tooltipLeft } from './tooltip-position.js';

	interface Item {
		label: string;
		/** Already formatted. */
		value: string;
		/** Series colour, shown as a swatch before the label. */
		color?: string;
		/** Swatch shape: a line for line charts, a square otherwise. */
		shape?: 'line' | 'square';
	}

	interface Props {
		/** Heading of the card, e.g. the date or category. */
		title?: string;
		/** One row per series: swatch, label and value. */
		items?: Item[];
		/** Plot-area pixel position. */
		x: number;
		y: number;
		visible?: boolean;
		/** Distance from the point, px. */
		offset?: number;
		class?: string;
		children?: Snippet;
	}

	let { title, items = [], x, y, visible = true, offset = 12, class: className = '', children }: Props = $props();

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
		{#if title}<strong class="mz-tooltip-title">{title}</strong>{/if}
		{#if items.length}
			<div class="mz-tooltip-items">
				{#each items as item, i (i)}
					<span class="mz-tooltip-swatch {item.shape ?? 'square'}" style:background={item.color ?? 'transparent'}
					></span>
					<span class="mz-tooltip-label">{item.label}</span>
					<strong class="mz-tooltip-value">{item.value}</strong>
				{/each}
			</div>
		{/if}
		{@render children?.()}
	</div>
{/if}

<style>
	.mz-tooltip {
		position: absolute;
		z-index: 1;
		/* Size to the content, not to the room left of `left`: otherwise moving the card changes
		   its width, which moves it again (a ResizeObserver loop near the right edge). */
		width: max-content;
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
	.mz-tooltip-title {
		display: block;
		margin-bottom: 0.2rem;
	}
	.mz-tooltip-items {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		column-gap: 0.4rem;
		row-gap: 0.15rem;
	}
	.mz-tooltip-swatch {
		width: 0.7rem;
		height: 0.7rem;
	}
	.mz-tooltip-swatch.line {
		height: 3px;
	}
	.mz-tooltip-value {
		text-align: right;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
</style>
