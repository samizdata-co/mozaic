<script lang="ts">
	import { link } from '#lib/link.ts';
	import { examples } from '#lib/gallery/index.ts';
	import { settings } from '#lib/settings.svelte.ts';

	const tags = [...new Set(examples.flatMap((e) => e.tags))].sort();
	let tag = $state<string | null>(null);
	const shown = $derived(tag ? examples.filter((e) => e.tags.includes(tag!)) : examples);
</script>

<svelte:head><title>Gallery · mozaic</title></svelte:head>

<main>
	<h1>Gallery</h1>
	<p class="lead">
		Every example is a complete chart file you can copy. All data is synthetic. Use the switcher at the top to see each
		style and language.
	</p>
	<div class="tags" role="group" aria-label="Filter by tag">
		<button type="button" aria-pressed={tag === null} onclick={() => (tag = null)}>All</button>
		{#each tags as t (t)}<button type="button" aria-pressed={tag === t} onclick={() => (tag = t)}>{t}</button>{/each}
	</div>
	<ul class="grid">
		{#each shown as example (example.slug)}
			<!-- The title link is stretched over the card; charts may contain their own links and buttons. -->
			<li class="card">
				<div class="thumb" aria-hidden="true" inert>
					{#if example.kind === 'story'}
						<div class="story">Scroll story ↗</div>
					{:else}
						<example.component style={settings.style} locale={settings.locale} />
					{/if}
				</div>
				<h2><a href={link(`gallery/${example.slug}/`)}>{example.title}</a></h2>
				<p>{example.description}</p>
			</li>
		{/each}
	</ul>
</main>

<style>
	main {
		max-width: 1240px;
		margin: 0 auto;
		padding: 1.5rem 16px;
	}
	.lead {
		color: var(--docs-muted);
	}
	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
		margin: 1rem 0 1.5rem;
	}
	.tags button {
		font: inherit;
		font-size: 0.8125rem;
		padding: 0.2rem 0.6rem;
		border: 1px solid var(--docs-border);
		border-radius: 999px;
		background: var(--docs-bg);
		color: var(--docs-text);
		cursor: pointer;
	}
	.tags button[aria-pressed='true'] {
		background: var(--docs-text);
		color: var(--docs-bg);
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
		gap: 1.5rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.card {
		position: relative;
	}
	.card a {
		color: var(--docs-text);
		text-decoration: none;
	}
	.card a::after {
		content: '';
		position: absolute;
		inset: 0;
	}
	.card:hover h2 {
		text-decoration: underline;
	}
	.thumb {
		height: 300px;
		overflow: hidden;
		padding: 12px;
		background: #fff;
		border: 1px solid var(--docs-border);
		border-radius: 6px;
		pointer-events: none;
		mask-image: linear-gradient(to bottom, #000 85%, transparent);
	}
	.story {
		display: grid;
		place-items: center;
		height: 100%;
		color: #555;
		font-weight: 700;
	}
	h2 {
		margin: 0.5rem 0 0.125rem;
		font-size: 1rem;
	}
	p {
		margin: 0;
		color: var(--docs-muted);
		font-size: 0.875rem;
	}
</style>
