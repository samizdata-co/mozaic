<!--
@component
Notes, sources and credits below the plot. Each takes the full width, except the `Source` line,
which shares its row with the house logo on the right. Without a `Source`, the logo sits below
the rest, on the right.
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
	{@render children?.()}
	{#if logo}<Logo />{/if}
</footer>

<style>
	.mz-footer {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		/* Dense, so the logo (last in the markup) goes back up to the free cell beside the source. */
		grid-auto-flow: row dense;
		align-items: center;
		column-gap: 1rem;
		row-gap: 0.25rem;
		font-size: var(--mz-size-small);
		line-height: 1.4;
		color: var(--mz-color-muted);
	}
	.mz-footer > :global(*) {
		grid-column: 1 / -1;
	}
	.mz-footer > :global(.mz-source) {
		grid-column: 1;
	}
	.mz-footer > :global(.mz-logo) {
		grid-column: 2;
		justify-self: end;
	}
	/* No taller than one and a half lines of footer text, whatever height the style gives the mark. */
	.mz-footer > :global(.mz-logo .mz-logo-mark) {
		max-height: 1.5lh;
	}
</style>
