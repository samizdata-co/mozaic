<!--
@component
A row of swatches with labels. Pass `items` directly, or a d3 ordinal or
threshold colour `scale` (with `format` for threshold values). Text uses
text colours; only the swatch carries the data colour.
Bind `active` (start it at `null`) to link the legend to a mark: pointing at an
item sets `active` to its index, and an active item stays at full strength
while the others are dimmed.
-->
<script lang="ts">
	import { useChart } from '../core/context.js';
	import { touchHold } from '../interactive/touch-hold.js';

	type Item = { label: string; color: string };
	type ColorScale = {
		domain(): any[];
		range(): string[];
		invertExtent?: (color: string) => [any, any];
	};

	interface Props {
		items?: Item[];
		scale?: ColorScale;
		/** Formats threshold values (or ordinal domain values). */
		format?: (value: any) => string;
		shape?: 'square' | 'line' | 'circle';
		title?: string;
		/**
		 * Index of the highlighted item, or null for none. Leave it undefined for a static legend;
		 * bind it (`bind:active`, starting at null) to highlight items under the pointer.
		 */
		active?: number | null;
		/** Opacity of the other items while one is highlighted. */
		dim?: number;
		class?: string;
	}

	let {
		items,
		scale,
		format,
		shape = 'square',
		title,
		active = $bindable(),
		dim = 0.35,
		class: className = ''
	}: Props = $props();

	const chart = useChart();

	function fromScale(s: ColorScale): Item[] {
		const fmt = format ?? ((v: unknown) => (typeof v === 'number' ? chart.locale.number(v) : String(v)));
		if (s.invertExtent) {
			// Threshold scale: n thresholds, n + 1 colours.
			const thresholds = s.domain();
			return s.range().map((color, i) => {
				const label =
					i === 0
						? `< ${fmt(thresholds[0])}`
						: i === thresholds.length
							? `≥ ${fmt(thresholds[i - 1])}`
							: `${fmt(thresholds[i - 1])}–${fmt(thresholds[i])}`;
				return { label, color };
			});
		}
		const range = s.range();
		return s.domain().map((value, i) => ({ label: fmt(value), color: range[i % range.length] }));
	}

	const resolved = $derived(items ?? (scale ? fromScale(scale) : []));

	const live = $derived(active !== undefined && chart.medium !== 'print');
	let list = $state<HTMLUListElement>();
	const hold = touchHold(
		() => list,
		() => (active = null)
	);
	$effect(() => hold.destroy);
</script>

<div class="mz-legend {className}">
	{#if title}<span class="mz-legend-title">{title}</span>{/if}
	<ul
		bind:this={list}
		class:mz-legend-live={live}
		onpointerdown={live ? hold.down : undefined}
		onpointercancel={live ? hold.cancel : undefined}
		onpointerleave={live ? hold.leave : undefined}
	>
		{#each resolved as item, i (item.label)}
			<li
				style:opacity={active !== null && active !== undefined && active !== i ? dim : undefined}
				onpointerenter={live ? () => (active = i) : undefined}
			>
				<span class="mz-swatch mz-swatch-{shape}" style:background={item.color}></span>
				{item.label}
			</li>
		{/each}
	</ul>
</div>

<style>
	.mz-legend {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.25rem 0.75rem;
		font-size: var(--mz-size-small);
		color: var(--mz-color-text);
	}
	.mz-legend-title {
		font-family: var(--mz-font-label);
		font-weight: var(--mz-weight-label);
		text-transform: var(--mz-label-transform);
		letter-spacing: var(--mz-label-tracking);
	}
	ul {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 0.75rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.mz-legend-live li {
		cursor: default;
		transition: opacity 120ms;
	}
	li {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}
	.mz-swatch {
		display: inline-block;
		flex: none;
	}
	.mz-swatch-square {
		width: 0.75rem;
		height: 0.75rem;
		border-radius: min(var(--mz-radius), 2px);
	}
	.mz-swatch-circle {
		width: 0.625rem;
		height: 0.625rem;
		border-radius: 50%;
	}
	.mz-swatch-line {
		width: 1rem;
		height: 2px;
		border-radius: 1px;
	}
</style>
