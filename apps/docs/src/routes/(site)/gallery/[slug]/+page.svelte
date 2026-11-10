<script lang="ts">
	import { link } from '#lib/link.ts';
	import ChartFrame from '#lib/components/ChartFrame.svelte';
	import CodeBlock from '#lib/components/CodeBlock.svelte';
	import { examples, getExample } from '#lib/gallery/index.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const example = $derived(getExample(data.slug)!);
	const index = $derived(examples.indexOf(example));
</script>

<svelte:head><title>{example.title} · Gallery · mozaic</title></svelte:head>

<main>
	<p class="crumbs"><a href={link('gallery/')}>Gallery</a> / {example.title}</p>
	<h1>{example.title}</h1>
	<p class="lead">{example.description}</p>
	<p class="tags">
		{#each example.tags as tag (tag)}<span>{tag}</span>{/each}
	</p>

	{#key example.slug}
		<ChartFrame {example} />
	{/key}

	<h2>Source</h2>
	<p>
		Copy both files into <code>charts/src/charts/&lt;slug&gt;/</code> of an analysis project. <code>../types</code> and
		<code>../common</code>
		are small docs-site helpers: replace them with your project's <code>ChartProps</code> and your own notes and source.
	</p>
	<div class="code">
		<CodeBlock code={example.source} label="Chart.svelte" />
		{#if example.data}<CodeBlock code={example.data} label="data.ts" lang="ts" />{/if}
	</div>

	<nav class="pager" aria-label="Previous and next example">
		{#if index > 0}<a href={link(`gallery/${examples[index - 1].slug}/`)}>← {examples[index - 1].title}</a>{:else}<span
			></span>{/if}
		{#if index < examples.length - 1}<a href={link(`gallery/${examples[index + 1].slug}/`)}
				>{examples[index + 1].title} →</a
			>{/if}
	</nav>
</main>

<style>
	main {
		max-width: 1040px;
		margin: 0 auto;
		padding: 1.5rem 16px;
	}
	.crumbs {
		font-size: 0.875rem;
		color: var(--docs-muted);
	}
	h1 {
		margin: 0.25rem 0;
	}
	.lead {
		color: var(--docs-muted);
		max-width: 46rem;
	}
	.tags {
		display: flex;
		gap: 0.375rem;
	}
	.tags span {
		font-size: 0.75rem;
		padding: 0.1rem 0.5rem;
		border: 1px solid var(--docs-border);
		border-radius: 999px;
		color: var(--docs-muted);
	}
	h2 {
		margin-top: 2.5rem;
	}
	.code {
		display: grid;
		gap: 1rem;
	}
	.pager {
		display: flex;
		justify-content: space-between;
		margin-top: 3rem;
		padding-top: 1rem;
		border-top: 1px solid var(--docs-border);
	}
</style>
