<script lang="ts">
	import { link } from '#lib/link.ts';
	import { examples } from '#lib/gallery/index.ts';
	import { settings } from '#lib/settings.svelte.ts';
	import { styles } from '#lib/styles.ts';

	const featured = ['regional-lines', 'raion-map', 'stacked-columns'].map((slug) =>
		examples.find((e) => e.slug === slug)!
	);
</script>

<svelte:head><title>mozaic — chart library</title></svelte:head>

<main>
	<section class="hero">
		<h1>mozaic</h1>
		<p class="lead">
			A chart library for the web and print, built on Svelte 5 and d3. Plain d3 scales and small composable components,
			so you can build any chart; house styles you bring from each outlet's brand; embeds that resize themselves; and
			SVG, PDF and PNG export for print.
		</p>
		<p class="links">
			<a class="primary" href={link('docs/getting-started/')}>Get started</a>
			<a href={link('gallery/')}>Browse the gallery</a>
			<a href={link('docs/concepts/')}>How it works</a>
		</p>
	</section>

	<section class="featured" aria-label="Featured examples">
		{#each featured as example (example.slug)}
			<div class="card">
				<div class="thumb" aria-hidden="true" inert>
					<example.component style={styles[settings.style]} locale={settings.locale} />
				</div>
				<a href={link(`gallery/${example.slug}/`)}>{example.title}</a>
			</div>
		{/each}
	</section>

	<section class="points">
		<div>
			<h2>Any chart</h2>
			<p>
				Marks, axes, legends and annotations are ordinary components on top of d3 scales. Copy one, change it, or draw
				raw SVG with the plot's scales.
			</p>
		</div>
		<div>
			<h2>House styles and languages</h2>
			<p>
				Switch style and language with one prop. Fonts, colours, number and date formats follow. Try the switcher at the
				top of the page.
			</p>
		</div>
		<div>
			<h2>Embeds and print</h2>
			<p>
				Each chart builds to a static, self-sizing embed. <code>mozaic export</code> renders the same chart to SVG, PDF and
				PNG at print widths.
			</p>
		</div>
		<div>
			<h2>Built for AI authors</h2>
			<p>
				Explicit, typed components, an <code>AGENTS.md</code>, a Claude Code skill in every project, and
				<a href={link('llms.txt')}>llms.txt</a>.
			</p>
		</div>
	</section>
</main>

<style>
	main {
		max-width: 1120px;
		margin: 0 auto;
		padding: 2rem 16px;
	}
	.hero h1 {
		margin: 0;
		font-size: clamp(2.5rem, 6vw, 4rem);
		letter-spacing: -0.02em;
	}
	.lead {
		max-width: 46rem;
		font-size: 1.125rem;
		color: var(--docs-muted);
	}
	.links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}
	.links a {
		padding: 0.5rem 0.9rem;
		border: 1px solid var(--docs-border);
		border-radius: 6px;
		text-decoration: none;
		font-weight: 600;
	}
	.links a.primary {
		background: var(--docs-accent);
		border-color: var(--docs-accent);
		color: var(--docs-bg);
	}
	.featured {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1rem;
		margin: 2.5rem 0;
	}
	.card {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-weight: 600;
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
	.thumb {
		padding: 12px;
		background: #fff;
		border: 1px solid var(--docs-border);
		border-radius: 6px;
		pointer-events: none;
	}
	.points {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1.5rem;
	}
	.points h2 {
		font-size: 1.0625rem;
		margin: 0 0 0.25rem;
	}
	.points p {
		margin: 0;
		color: var(--docs-muted);
	}
</style>
