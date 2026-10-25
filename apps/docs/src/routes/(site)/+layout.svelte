<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { link } from '#lib/link.ts';
	import StyleControls from '#lib/components/StyleControls.svelte';
	import { loadSettings } from '#lib/settings.svelte.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
	onMount(loadSettings);

	const nav = [
		{ href: 'docs/getting-started/', label: 'Docs', match: '/docs' },
		{ href: 'gallery/', label: 'Gallery', match: '/gallery' },
		{ href: 'api/', label: 'API', match: '/api' }
	];
	const current = (match: string) => page.url.pathname.includes(match);
</script>

<svelte:head><title>mozaic</title></svelte:head>

<a class="skip" href="#main">Skip to content</a>
<header class="site">
	<a class="brand" href={link('')}>mozaic</a>
	<nav aria-label="Main">
		{#each nav as item (item.href)}
			<a href={link(item.href)} aria-current={current(item.match) ? 'page' : undefined}>{item.label}</a>
		{/each}
	</nav>
	<StyleControls />
</header>

<div id="main">
	{@render children()}
</div>

<footer class="site">mozaic — charts for SAMIZDATA and Ziarul de Gardă. Example data on this site is synthetic.</footer>

<style>
	:global(:root) {
		--docs-bg: #ffffff;
		--docs-surface: #f6f6f4;
		--docs-text: #1a1a1a;
		--docs-muted: #5f5f5f;
		--docs-border: #dddcd8;
		--docs-accent: #1f5bb5;
		--docs-code-bg: #f6f6f4;
		color-scheme: light;
	}
	@media (prefers-color-scheme: dark) {
		:global(:root) {
			--docs-bg: #161616;
			--docs-surface: #1f1f1f;
			--docs-text: #ececea;
			--docs-muted: #a8a8a3;
			--docs-border: #353533;
			--docs-accent: #7aa7ec;
			--docs-code-bg: #1f1f1f;
			color-scheme: dark;
		}
	}
	:global(body) {
		margin: 0;
		background: var(--docs-bg);
		color: var(--docs-text);
		font-family:
			system-ui,
			-apple-system,
			'Segoe UI',
			Roboto,
			sans-serif;
		line-height: 1.55;
	}
	:global(a) {
		color: var(--docs-accent);
	}
	:global(code) {
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		font-size: 0.9em;
	}
	.skip {
		position: absolute;
		left: -999px;
	}
	.skip:focus {
		left: 8px;
		top: 8px;
		z-index: 10;
		background: var(--docs-bg);
		padding: 0.5rem;
	}
	header.site {
		position: sticky;
		top: 0;
		z-index: 5;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 1.5rem;
		padding: 0.6rem 16px;
		background: var(--docs-bg);
		border-bottom: 1px solid var(--docs-border);
	}
	.brand {
		font-weight: 800;
		font-size: 1.125rem;
		letter-spacing: 0.02em;
		color: var(--docs-text);
		text-decoration: none;
	}
	nav {
		display: flex;
		gap: 1rem;
		margin-right: auto;
	}
	nav a {
		color: var(--docs-muted);
		text-decoration: none;
		font-weight: 600;
		font-size: 0.9375rem;
	}
	nav a[aria-current='page'] {
		color: var(--docs-text);
		text-decoration: underline;
		text-underline-offset: 6px;
	}
	footer.site {
		margin-top: 4rem;
		padding: 1.5rem 16px;
		border-top: 1px solid var(--docs-border);
		color: var(--docs-muted);
		font-size: 0.8125rem;
	}
</style>
