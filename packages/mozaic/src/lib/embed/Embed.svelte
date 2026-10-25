<!--
@component
Wraps the chart on an embed page. It reports its height to the host page
(see `embed.js`), removes page margins, and exposes `window.__mozaic` so
`mozaic export` can render SVG from the live chart.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { observeHeight } from './resize.js';
	import { figureToSvg } from '../export/figure-to-svg.js';

	interface Props {
		/** Identifies this embed in resize messages; defaults to the URL path. */
		id?: string;
		children?: Snippet;
	}

	let { id, children }: Props = $props();

	let container = $state<HTMLDivElement>();

	$effect(() => {
		if (!container) return;
		const el = container;
		const stop = observeHeight(el, id ?? location.pathname);
		(window as unknown as { __mozaic: unknown }).__mozaic = {
			ready: true,
			toSvg: () => figureToSvg((el.querySelector('.mz-chart') as HTMLElement | null) ?? el)
		};
		return stop;
	});
</script>

<div class="mz-embed" bind:this={container}>
	{@render children?.()}
</div>

<style>
	:global(html),
	:global(body) {
		margin: 0;
		padding: 0;
		background: transparent;
	}
	.mz-embed {
		display: flow-root;
	}
</style>
