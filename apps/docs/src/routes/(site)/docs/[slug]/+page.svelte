<script lang="ts">
	import { link } from '#lib/link.ts';
	import { docs } from '#lib/content.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const sections = [...new Set(docs.map((d) => d.section))];
	const index = $derived(docs.findIndex((d) => d.slug === data.slug));
</script>

<svelte:head><title>{data.title} · mozaic</title></svelte:head>

<div class="layout">
	<aside>
		<nav aria-label="Documentation">
			{#each sections as section (section)}
				<h2>{section}</h2>
				<ul>
					{#each docs.filter((d) => d.section === section) as doc (doc.slug)}
						<li>
							<a href={link(`docs/${doc.slug}/`)} aria-current={doc.slug === data.slug ? 'page' : undefined}
								>{doc.title}</a
							>
						</li>
					{/each}
				</ul>
			{/each}
		</nav>
	</aside>
	<main>
		<article class="prose">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- our own Markdown, rendered at build time -->
			{@html data.html}
		</article>
		<nav class="pager" aria-label="Previous and next">
			{#if index > 0}<a href={link(`docs/${docs[index - 1].slug}/`)}>← {docs[index - 1].title}</a>{:else}<span
				></span>{/if}
			{#if index < docs.length - 1}<a href={link(`docs/${docs[index + 1].slug}/`)}>{docs[index + 1].title} →</a>{/if}
		</nav>
	</main>
</div>

<style>
	.layout {
		display: grid;
		grid-template-columns: 220px minmax(0, 1fr);
		gap: 2.5rem;
		max-width: 1120px;
		margin: 0 auto;
		padding: 1.5rem 16px;
	}
	@media (max-width: 760px) {
		.layout {
			grid-template-columns: 1fr;
		}
		aside {
			border-bottom: 1px solid var(--docs-border);
			padding-bottom: 1rem;
		}
	}
	aside h2 {
		margin: 1rem 0 0.25rem;
		font-size: 0.75rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--docs-muted);
	}
	aside ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	aside a {
		display: block;
		padding: 0.2rem 0;
		color: var(--docs-text);
		text-decoration: none;
		font-size: 0.9375rem;
	}
	aside a[aria-current='page'] {
		color: var(--docs-accent);
		font-weight: 700;
	}
	.prose {
		max-width: 46rem;
	}
	.prose :global(h1) {
		margin-top: 0;
		font-size: 2rem;
	}
	.prose :global(h2) {
		margin-top: 2.25rem;
		font-size: 1.375rem;
	}
	.prose :global(pre) {
		padding: 0.85rem 1rem;
		overflow-x: auto;
		background: var(--docs-code-bg);
		border: 1px solid var(--docs-border);
		border-radius: 6px;
		font-size: 0.8125rem;
		line-height: 1.5;
		tab-size: 2;
	}
	.prose :global(:not(pre) > code) {
		padding: 0.1em 0.3em;
		background: var(--docs-code-bg);
		border-radius: 3px;
	}
	.prose :global(table) {
		border-collapse: collapse;
		width: 100%;
		font-size: 0.875rem;
	}
	.prose :global(th),
	.prose :global(td) {
		padding: 0.4rem 0.6rem;
		border-bottom: 1px solid var(--docs-border);
		text-align: left;
		vertical-align: top;
	}
	.prose :global(blockquote) {
		margin: 1rem 0;
		padding: 0.25rem 1rem;
		border-left: 3px solid var(--docs-accent);
		color: var(--docs-muted);
	}
	.pager {
		display: flex;
		justify-content: space-between;
		margin-top: 3rem;
		padding-top: 1rem;
		border-top: 1px solid var(--docs-border);
	}
</style>
