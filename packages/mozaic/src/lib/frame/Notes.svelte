<!--
@component
"Note: …", with the label in the chart's language. Set `plural` for several notes.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useChart } from '../core/context.js';

	let { plural = false, children }: { plural?: boolean; children?: Snippet } = $props();

	const chart = useChart();
</script>

<p class="mz-notes">
	<span class="mz-label">{plural ? chart.locale.strings.notes : chart.locale.strings.note}:</span>
	{@render children?.()}
</p>

<style>
	.mz-notes {
		margin: 0;
	}
	.mz-label {
		font-family: var(--mz-font-label);
		font-weight: var(--mz-weight-label);
		text-transform: var(--mz-label-transform);
		letter-spacing: var(--mz-label-tracking);
	}
</style>
