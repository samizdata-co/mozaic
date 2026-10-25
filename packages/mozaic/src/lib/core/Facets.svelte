<!--
@component
Small multiples: a responsive grid with one cell per group. Render a `<Plot>`
in each cell from the children snippet. For comparable panels, build the
scales once from all the data and pass the same scales to every cell.

```svelte
<Facets groups={regions} columns={{ s: 2, l: 4 }} title={(g) => g.name}>
  {#snippet children(group)}
    <Plot {x} {y} height={120}><Svg><Line data={group.values} … /></Svg></Plot>
  {/snippet}
</Facets>
```
-->
<script lang="ts" generics="G">
	import type { Snippet } from 'svelte';
	import { setInitialWidth, useChart } from './context.js';
	import type { Breakpoint } from './types.js';

	interface Props {
		groups: G[];
		/** Column count, fixed or per breakpoint (smaller breakpoints inherit upwards). */
		columns?: number | Partial<Record<Breakpoint, number>>;
		/** CSS gap between cells. */
		gap?: string;
		/** Panel title. */
		title?: (group: G, index: number) => string;
		class?: string;
		children: Snippet<[G, number]>;
	}

	let {
		groups,
		columns = { s: 2, m: 3, l: 4 },
		gap = '1rem 1.25rem',
		title,
		class: className = '',
		children
	}: Props = $props();

	const chart = useChart();

	const count = $derived.by(() => {
		if (typeof columns === 'number') return columns;
		const order: Breakpoint[] = ['s', 'm', 'l'];
		let n = 1;
		for (const bp of order.slice(0, order.indexOf(chart.breakpoint) + 1)) n = columns[bp] ?? n;
		return Math.max(1, Math.min(n, groups.length));
	});

	// Rough cell width so server-rendered plots are close to their final size.
	setInitialWidth(() => (chart.width - 16 * (count - 1)) / count);
</script>

<div class="mz-facets {className}" style:grid-template-columns="repeat({count}, minmax(0, 1fr))" style:gap>
	{#each groups as group, i}
		<div class="mz-facet">
			{#if title}<h3 class="mz-facet-title">{title(group, i)}</h3>{/if}
			{@render children(group, i)}
		</div>
	{/each}
</div>

<style>
	.mz-facets {
		display: grid;
	}
	.mz-facet {
		min-width: 0;
	}
	.mz-facet-title {
		margin: 0 0 0.25rem;
		font-size: var(--mz-size-small);
		font-family: var(--mz-font-label);
		font-weight: var(--mz-weight-label);
		text-transform: var(--mz-label-transform);
		letter-spacing: var(--mz-label-tracking);
		color: var(--mz-color-text);
	}
</style>
