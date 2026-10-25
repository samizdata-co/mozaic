<!--
@component
Notes, sources and credits below the plot, with the house wordmark on the right.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Logo from './Logo.svelte';

	let {
		logo = true,
		class: className = '',
		children
	}: { logo?: boolean; class?: string; children?: Snippet } = $props();
</script>

<footer class="mz-footer {className}">
	<div class="mz-footer-text">
		{@render children?.()}
	</div>
	{#if logo}<Logo />{/if}
</footer>

<style>
	.mz-footer {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1rem;
		font-size: var(--mz-size-small);
		line-height: 1.4;
		color: var(--mz-color-muted);
	}
	.mz-footer-text {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 0;
	}
</style>
