<!--
@component
The chart headline. Its id labels the chart's SVG for screen readers.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useChart } from '../core/context.js';

	let { class: className = '', children }: { class?: string; children?: Snippet } = $props();

	const chart = useChart();
	// Inside a <Chart> (not the shared fallback context), tell the SVG layers there is a title to point to.
	if (chart.ids.title) chart.ids.hasTitle = true;
</script>

<h2 id={chart.ids.title || undefined} class="mz-title {className}">
	{@render children?.()}
</h2>

<style>
	.mz-title {
		margin: 0;
		font-family: var(--mz-font-title);
		font-size: var(--mz-size-title);
		font-weight: var(--mz-weight-title);
		line-height: var(--mz-line-title);
		letter-spacing: var(--mz-tracking-title);
		color: var(--mz-color-text);
		text-wrap: balance;
	}
</style>
