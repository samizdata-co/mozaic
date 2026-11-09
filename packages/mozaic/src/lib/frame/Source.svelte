<!--
@component
"Source: …", with the label in the chart's language. Pass `sources` as text or as a list of
sources with optional links (`[{ label: 'ANRE', href: 'https://anre.md/…' }, …]`, joined with
"; "), or write the text as children. The label turns plural for more than one listed source,
or set `plural`. Links open in a new tab; in print they are plain text.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useChart } from '../core/context.js';
	import type { SourceItem } from './types.js';

	interface Props {
		/** The sources: plain text, or a list of sources with optional links. */
		sources?: string | SourceItem[];
		/** Use the plural label ("Sources"). Defaults to true for more than one item in `sources`. */
		plural?: boolean;
		children?: Snippet;
	}

	let { sources, plural, children }: Props = $props();

	const chart = useChart();
	const items = $derived<SourceItem[]>(typeof sources === 'string' ? [{ label: sources }] : (sources ?? []));
	const many = $derived(plural ?? (Array.isArray(sources) && sources.length > 1));
	const linked = $derived(chart.medium !== 'print');
</script>

<p class="mz-source">
	<span class="mz-label">{many ? chart.locale.strings.sources : chart.locale.strings.source}:</span>
	{#each items as item, i (i)}{i > 0 ? '; ' : ''}{#if item.href && linked}<a
				href={item.href}
				target="_blank"
				rel="noopener">{item.label}</a
			>{:else}{item.label}{/if}{/each}
	{@render children?.()}
</p>

<style>
	.mz-source {
		margin: 0;
	}
	.mz-label {
		font-family: var(--mz-font-label);
		font-weight: var(--mz-weight-label);
		text-transform: var(--mz-label-transform);
		letter-spacing: var(--mz-label-tracking);
	}
	.mz-source a {
		color: inherit;
		text-decoration-line: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 2px;
	}
	.mz-source a:hover {
		text-decoration-thickness: 2px;
	}
</style>
