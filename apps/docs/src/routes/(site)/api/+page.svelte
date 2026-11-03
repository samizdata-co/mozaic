<script lang="ts">
	import { link } from '#lib/link.ts';
	import { components, modules } from '#lib/api/index.ts';

	const firstSentence = (text: string) =>
		text
			.split(/\n\s*\n/)[0]
			.replace(/\s+/g, ' ')
			.split(/(?<=\.)\s/)[0];
</script>

<svelte:head><title>API · mozaic</title></svelte:head>

<main>
	<h1>API reference</h1>
	<p class="lead">
		Generated from the component sources, so it always matches the code. Import components from the module shown, e.g.
		<code>import &lbrace; Bars &rbrace; from '@samizdata/mozaic/marks'</code>. Functions (transforms, locale, styles,
		export) are covered in the
		<a href={link('docs/concepts/')}>docs</a>.
	</p>
	{#each modules as module (module.name)}
		<section>
			<h2><code>@samizdata/mozaic/{module.name}</code></h2>
			<p class="summary">{module.summary}</p>
			<dl>
				{#each components.filter((c) => c.module === module.name) as component (component.name)}
					<dt><a href={link(`api/${component.name}/`)}>{component.name}</a></dt>
					<dd>{firstSentence(component.description)}</dd>
				{/each}
			</dl>
		</section>
	{/each}
</main>

<style>
	main {
		max-width: 960px;
		margin: 0 auto;
		padding: 1.5rem 16px;
	}
	.lead,
	.summary {
		color: var(--docs-muted);
	}
	section {
		margin-top: 2rem;
	}
	h2 {
		margin-bottom: 0;
		font-size: 1.125rem;
	}
	dl {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 0.35rem 1.25rem;
	}
	dt {
		font-weight: 700;
	}
	dd {
		margin: 0;
		color: var(--docs-muted);
	}
	@media (max-width: 600px) {
		dl {
			grid-template-columns: 1fr;
		}
		dd {
			margin-bottom: 0.5rem;
		}
	}
</style>
