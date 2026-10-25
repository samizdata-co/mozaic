<!--
@component
A line under the title saying what is measured, in which unit, over which period.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let { class: className = '', children }: { class?: string; children?: Snippet } = $props();
</script>

<p class="mz-subtitle {className}">
	{@render children?.()}
</p>

<style>
	.mz-subtitle {
		margin: 0;
		font-size: var(--mz-size-subtitle);
		line-height: 1.35;
		color: var(--mz-color-muted);
	}
</style>
