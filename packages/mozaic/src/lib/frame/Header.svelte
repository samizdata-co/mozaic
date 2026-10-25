<!--
@component
Groups the title, subtitle and any legend above the plot.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let { class: className = '', children }: { class?: string; children?: Snippet } = $props();
</script>

<header class="mz-header {className}">
	{@render children?.()}
</header>

<style>
	.mz-header {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}
</style>
