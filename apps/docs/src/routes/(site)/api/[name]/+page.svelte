<script lang="ts">
	import { link } from '#lib/link.ts';
	import { getComponent } from '#lib/api/index.ts';
	import { examples } from '#lib/gallery/index.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const component = $derived(getComponent(data.name)!);
	// Gallery examples that use this component.
	const usedIn = $derived(examples.filter((e) => new RegExp(`<${component.name}[\\s>/]`).test(e.source)));
</script>

<svelte:head><title>{component.name} · API · mozaic</title></svelte:head>

<main>
	<p class="crumbs"><a href={link('api/')}>API</a> / <code>@samizdata/mozaic/{component.module}</code></p>
	<h1>
		{component.name}{#if component.generics}<span class="generics">&lt;{component.generics}&gt;</span>{/if}
	</h1>
	<pre class="import"><code>import &lbrace; {component.name} &rbrace; from '@samizdata/mozaic/{component.module}';</code
		></pre>
	<div class="description">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- the library's own doc comments, rendered at build time -->
		{@html data.description}
	</div>

	<h2>Props</h2>
	{#if component.props.length}
		<div class="table-wrap">
			<table>
				<thead><tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
				<tbody>
					{#each component.props as prop (prop.name)}
						<tr>
							<td
								><code>{prop.name}</code>{#if !prop.optional}<span class="required" title="required">*</span>{/if}</td
							>
							<td><code class="type">{prop.type}</code></td>
							<td
								>{#if prop.default}<code>{prop.default}</code>{/if}</td
							>
							<td>{prop.description}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="note"><span class="required">*</span> required</p>
	{:else}
		<p>No props.</p>
	{/if}

	{#if usedIn.length}
		<h2>Used in</h2>
		<ul>
			{#each usedIn as example (example.slug)}<li>
					<a href={link(`gallery/${example.slug}/`)}>{example.title}</a>
				</li>{/each}
		</ul>
	{/if}
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
	.generics {
		color: var(--docs-muted);
		font-weight: 400;
		font-size: 0.7em;
	}
	pre {
		padding: 0.75rem 1rem;
		background: var(--docs-code-bg);
		border: 1px solid var(--docs-border);
		border-radius: 6px;
		overflow-x: auto;
	}
	.description :global(pre) {
		padding: 0.75rem 1rem;
		background: var(--docs-code-bg);
		border: 1px solid var(--docs-border);
		border-radius: 6px;
		overflow-x: auto;
		font-size: 0.8125rem;
	}
	.table-wrap {
		overflow-x: auto;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
	}
	th,
	td {
		padding: 0.45rem 0.6rem;
		border-bottom: 1px solid var(--docs-border);
		text-align: left;
		vertical-align: top;
	}
	th {
		color: var(--docs-muted);
	}
	.type {
		white-space: pre-wrap;
		word-break: break-word;
	}
	.required {
		color: #c0392b;
		margin-left: 0.15rem;
	}
	.note {
		font-size: 0.8125rem;
		color: var(--docs-muted);
	}
</style>
