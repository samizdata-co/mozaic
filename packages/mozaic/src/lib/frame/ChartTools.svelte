<!--
@component
Icon buttons under a chart: "Show the data" (`<DataTable>` in the chart) opens its table; "Embed" (`<Chart embed>`) opens the iframe code that puts the chart on another
site, with a button that copies it; "Download" (`<Chart download>`, or `setDownloads()` above it) saves the
chart as PNG or SVG. Hidden in print and in exports; inside `<Embed>` only the data is offered.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useChart, useEmbedded } from '../core/context.js';
	import { embedCode, type ChartEmbed } from '../embed/code.js';
	import { downloadPng, downloadSvg, fileName } from '../export/download.js';

	interface Props {
		embed?: ChartEmbed;
		/** Offer PNG and SVG downloads; a string is the file name (without extension), else the title's. */
		download?: boolean | string;
		/** The chart's data table, from `<DataTable>`. */
		table?: Snippet | null;
	}

	let { embed: embedProp, download: downloadProp = false, table }: Props = $props();

	const chart = useChart();
	const embedded = useEmbedded();
	// An embedded chart does not offer its own embed code or downloads.
	const embed = $derived(embedded ? undefined : embedProp);
	const download = $derived(embedded ? false : downloadProp);
	const strings = $derived(chart.locale.strings);
	const uid = $props.id();

	let tools = $state<HTMLDivElement>();
	let textarea = $state<HTMLTextAreaElement>();
	let open = $state<'table' | 'embed' | 'download' | null>(null);
	/** Read from the page when the code is opened: URLs need the page's address, defaults its title and height. */
	let page = $state<{ base: string; title: string; height?: number }>();
	let copied = $state(false);

	const url = (path: string) => (page ? new URL(path, page.base).href : path);
	const code = $derived(
		embed
			? embedCode({
					src: url(embed.src),
					title: embed.title ?? page?.title ?? '',
					scriptSrc: embed.scriptSrc && url(embed.scriptSrc),
					height: embed.height ?? page?.height
				})
			: ''
	);

	const figure = () => tools?.closest('.mz-chart') as HTMLElement | null;
	const title = () => document.getElementById(chart.ids.title)?.textContent?.trim() ?? '';

	function toggle(tool: 'table' | 'embed' | 'download') {
		open = open === tool ? null : tool;
		if (open !== 'embed') return;
		const fig = figure();
		// The embed page shows the chart without these controls: measure down to what comes before them.
		const above = tools?.previousElementSibling;
		page = {
			base: document.baseURI,
			title: title(),
			height:
				fig && above ? Math.ceil(above.getBoundingClientRect().bottom - fig.getBoundingClientRect().top) : undefined
		};
	}

	async function copy() {
		try {
			await navigator.clipboard.writeText(code);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			// No clipboard (an insecure page, or permission refused): select the code to copy by hand.
			textarea?.select();
		}
	}

	function save(format: 'png' | 'svg') {
		const fig = figure();
		if (!fig) return;
		const name = `${typeof download === 'string' ? download : fileName(title())}.${format}`;
		if (format === 'svg') downloadSvg(fig, name);
		else void downloadPng(fig, name);
	}
</script>

{#if chart.medium !== 'print' && (table || embed || download)}
	<div class="mz-chart-tools" bind:this={tools}>
		<div class="mz-chart-tools-row">
			{#if table}
				<button
					type="button"
					class="mz-tool"
					aria-label={strings.showData}
					title={strings.showData}
					aria-expanded={open === 'table'}
					aria-controls="{uid}-table"
					onclick={() => toggle('table')}
				>
					<svg viewBox="0 0 16 16" aria-hidden="true"
						><rect x="2" y="2.5" width="12" height="11" rx="1" /><path d="M2 6.5h12M2 10h12M6.5 6.5v7" /></svg
					>
				</button>
			{/if}
			{#if embed}
				<button
					type="button"
					class="mz-tool"
					aria-label={strings.embed}
					title={strings.embed}
					aria-expanded={open === 'embed'}
					aria-controls="{uid}-embed"
					onclick={() => toggle('embed')}
				>
					<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 4 1.5 8l4 4M10.5 4l4 4-4 4" /></svg>
				</button>
			{/if}
			{#if download}
				<button
					type="button"
					class="mz-tool"
					aria-label={strings.downloadImage}
					title={strings.downloadImage}
					aria-expanded={open === 'download'}
					aria-controls="{uid}-download"
					onclick={() => toggle('download')}
				>
					<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v8.5M4.5 7 8 10.5 11.5 7M2.5 13.5h11" /></svg>
				</button>
			{/if}
		</div>
		{#if table}
			<div class="mz-data-table" id="{uid}-table" hidden={open !== 'table'}>
				{@render table()}
			</div>
		{/if}
		{#if embed}
			<div class="mz-embed-code" id="{uid}-embed" hidden={open !== 'embed'}>
				<textarea
					bind:this={textarea}
					readonly
					rows="4"
					spellcheck="false"
					aria-label={strings.embedCode}
					value={code}
					onfocus={(e) => e.currentTarget.select()}></textarea>
				<div class="mz-chart-tools-actions">
					<button type="button" class="mz-primary" onclick={copy}>{strings.copy}</button>
					<span role="status">{copied ? strings.copied : ''}</span>
				</div>
			</div>
		{/if}
		{#if download}
			<div
				class="mz-image-download mz-chart-tools-actions"
				id="{uid}-download"
				role="group"
				aria-label={strings.downloadImage}
				hidden={open !== 'download'}
			>
				<button type="button" class="mz-primary" onclick={() => save('png')}>PNG</button>
				<button type="button" class="mz-primary" onclick={() => save('svg')}>SVG</button>
			</div>
		{/if}
	</div>
{/if}

<style>
	.mz-chart-tools {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-family: var(--mz-font-label);
		font-size: var(--mz-size-small);
		color: var(--mz-color-muted);
	}
	/* Above the panels' own display. */
	.mz-chart-tools [hidden] {
		display: none;
	}
	.mz-chart-tools-row {
		display: flex;
		gap: 0.375rem;
	}
	.mz-tool {
		display: inline-grid;
		place-items: center;
		width: 1.75rem;
		height: 1.75rem;
		padding: 0;
		border: 1px solid var(--mz-color-border, var(--mz-color-grid));
		border-radius: var(--mz-radius);
		background: var(--mz-color-bg);
		color: var(--mz-color-muted);
		cursor: pointer;
	}
	.mz-tool:hover,
	.mz-tool[aria-expanded='true'] {
		color: var(--mz-color-text);
		border-color: var(--mz-color-axis);
	}
	.mz-tool svg {
		width: 1rem;
		height: 1rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.5;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	button:focus-visible,
	textarea:focus-visible {
		outline: 2px solid var(--mz-color-accent);
		outline-offset: 2px;
	}
	.mz-data-table {
		font-family: var(--mz-font-body);
		color: var(--mz-color-text);
	}
	.mz-embed-code {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	textarea {
		box-sizing: border-box;
		width: 100%;
		padding: 0.5rem;
		border: 1px solid var(--mz-color-grid);
		border-radius: var(--mz-radius);
		background: var(--mz-color-bg);
		color: var(--mz-color-text);
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 0.75rem;
		line-height: 1.4;
		resize: vertical;
		word-break: break-all;
	}
	.mz-chart-tools-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	.mz-image-download {
		gap: 0.5rem;
	}
	.mz-primary {
		padding: 0.3rem 0.75rem;
		border: 0;
		border-radius: var(--mz-radius);
		background: var(--mz-color-accent);
		color: #ffffff;
		font: inherit;
		font-weight: var(--mz-weight-label);
		text-transform: var(--mz-control-transform);
		letter-spacing: var(--mz-control-tracking);
		cursor: pointer;
	}
</style>
