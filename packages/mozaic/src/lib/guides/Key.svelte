<!--
@component
An inline legend entry for use inside text, e.g. a subtitle:
`Spending on <Key color={a}>health</Key> and <Key color={b}>education</Key>`.
The swatch carries the colour; the text stays in the text colour.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		color,
		shape = 'square',
		children
	}: { color: string; shape?: 'square' | 'line' | 'circle'; children?: Snippet } = $props();
</script>

<span class="mz-key"
	><span class="mz-key-swatch mz-key-{shape}" style:background={color} aria-hidden="true"
	></span>{@render children?.()}</span
>

<style>
	.mz-key {
		white-space: nowrap;
		font-weight: var(--mz-weight-strong);
		color: var(--mz-color-text);
	}
	.mz-key-swatch {
		display: inline-block;
		margin-right: 0.3em;
		vertical-align: 0.05em;
	}
	.mz-key-square {
		width: 0.7em;
		height: 0.7em;
		border-radius: min(var(--mz-radius), 2px);
	}
	.mz-key-circle {
		width: 0.65em;
		height: 0.65em;
		border-radius: 50%;
	}
	.mz-key-line {
		width: 1em;
		height: 2px;
		vertical-align: 0.3em;
	}
</style>
