<!-- A chart on a docs page: width control, print preview, downloads and embed code. -->
<script lang="ts">
	import { mm } from '@samizdata/mozaic/core';
	import { embedCode } from '@samizdata/mozaic/embed';
	import { downloadPng, downloadSvg } from '@samizdata/mozaic/export';
	import { styles } from '../styles';
	import type { Example } from '../gallery/types';
	import { settings } from '../settings.svelte';

	let { example, controls = true }: { example: Example; controls?: boolean } = $props();

	let width = $state(680);
	let medium = $state<'web' | 'print'>('web');
	let printWidth = $state('double');
	let frame = $state<HTMLElement>();
	const theme = $derived(styles[settings.style]);
	const figure = () => frame?.querySelector('.mz-chart') as HTMLElement;
	const fixedWidth = $derived(medium === 'print' ? Math.round(mm(theme.print.widths[printWidth] ?? 115)) : undefined);
	const embedPath = $derived(`embed/${example.slug}/${settings.style}/${settings.locale}/`);
	const origin = $derived(typeof location === 'undefined' ? '' : location.origin);
	const base = $derived(typeof document === 'undefined' ? '/' : new URL(document.baseURI).pathname);
</script>

{#if controls}
	<div class="toolbar">
		<label
			>Width <output>{width}px</output><input
				type="range"
				min="300"
				max="1000"
				step="10"
				bind:value={width}
				disabled={medium === 'print'}
			/></label
		>
		<label>
			Medium
			<select bind:value={medium}><option value="web">Web</option><option value="print">Print</option></select>
		</label>
		{#if medium === 'print'}
			<label>
				Print width
				<select bind:value={printWidth}>
					{#each Object.entries(theme.print.widths) as [name, w] (name)}<option value={name}>{name} ({w} mm)</option
						>{/each}
				</select>
			</label>
		{/if}
		{#if example.kind !== 'story'}
			<div class="buttons">
				<button type="button" onclick={() => downloadSvg(figure(), `${example.slug}.svg`)}>SVG</button>
				<button type="button" onclick={() => downloadPng(figure(), `${example.slug}.png`)}>PNG</button>
			</div>
		{/if}
	</div>
{/if}

<div
	class="frame"
	class:story={example.kind === 'story'}
	style:width={example.kind === 'story' ? undefined : `${fixedWidth ? fixedWidth + 34 : width}px`}
	bind:this={frame}
>
	<example.component style={theme} locale={settings.locale} {medium} width={fixedWidth} />
</div>

{#if controls && example.kind !== 'story'}
	<details class="embed">
		<summary>Embed code</summary>
		<pre><code
				>{embedCode({
					src: `${origin}${base}${embedPath}`,
					title: example.title,
					scriptSrc: `${origin}${base}embed.js`
				})}</code
			></pre>
		<p><a href="{base}{embedPath}">Open the embed page</a></p>
	</details>
{/if}

<style>
	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		gap: 0.75rem 1.25rem;
		margin-bottom: 0.75rem;
		font-size: 0.8125rem;
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		color: var(--docs-muted);
	}
	select,
	button {
		font: inherit;
		padding: 0.25rem 0.5rem;
		border: 1px solid var(--docs-border);
		border-radius: 4px;
		background: var(--docs-bg);
		color: var(--docs-text);
	}
	button {
		cursor: pointer;
		font-weight: 600;
	}
	.buttons {
		display: flex;
		gap: 0.375rem;
		margin-left: auto;
	}
	.frame {
		max-width: 100%;
		box-sizing: border-box;
		padding: 16px;
		background: #fff;
		border: 1px solid var(--docs-border);
		border-radius: 6px;
		overflow: hidden;
	}
	.frame.story {
		padding: 0;
		overflow: visible;
	}
	.embed {
		margin-top: 0.75rem;
		font-size: 0.8125rem;
	}
	.embed pre {
		white-space: pre-wrap;
		word-break: break-all;
		padding: 0.75rem;
		background: var(--docs-code-bg);
		border: 1px solid var(--docs-border);
		border-radius: 6px;
	}
</style>
