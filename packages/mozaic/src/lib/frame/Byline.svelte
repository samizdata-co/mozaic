<!--
@component
"Graphic: …" credit line, with the label in the chart's language.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useChart } from '../core/context.js';

	let { children }: { children?: Snippet } = $props();

	const chart = useChart();
</script>

<p class="mz-byline"><span class="mz-label">{chart.locale.strings.graphic}:</span> {@render children?.()}</p>

<style>
	.mz-byline {
		margin: 0;
	}
	.mz-label {
		font-family: var(--mz-font-label);
		font-weight: var(--mz-weight-label);
		text-transform: var(--mz-label-transform);
		letter-spacing: var(--mz-label-tracking);
	}
</style>
