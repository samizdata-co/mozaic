<!--
@component
The house logo in the chart footer: the style's SVG mark and/or text
wordmark, labelled with the brand name for screen readers.
-->
<script lang="ts">
	import { useChart } from '../core/context.js';

	const chart = useChart();
	const logo = $derived(chart.theme.logo);
</script>

{#if logo}
	<span class="mz-logo" role="img" aria-label={logo.label}>
		{#if logo.svg}
			<span class="mz-logo-mark" style:height="{logo.height ?? 16}px" aria-hidden="true">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- trusted markup from the style file -->
				{@html logo.svg}
			</span>
		{/if}
		{#if logo.text}<span class="mz-logo-text" aria-hidden="true">{logo.text}</span>{/if}
	</span>
{/if}

<style>
	.mz-logo {
		flex: none;
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		color: var(--mz-color-text);
	}
	.mz-logo-mark {
		display: inline-flex;
	}
	.mz-logo-mark :global(svg) {
		height: 100%;
		width: auto;
	}
	.mz-logo-text {
		font-family: var(--mz-font-title);
		font-weight: var(--mz-weight-title);
		font-size: var(--mz-size-small);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		line-height: 1;
	}
</style>
