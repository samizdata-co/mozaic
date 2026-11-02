<!--
@component
"Embed" under a chart (`<Chart embed>`): opens the iframe code that puts the chart on another site,
with a button that copies it. Hidden in print and inside `<Embed>`.
-->
<script lang="ts">
	import { useChart, useEmbedded } from '../core/context.js';
	import { embedCode, type ChartEmbed } from '../embed/code.js';

	let { src, scriptSrc, title, height }: ChartEmbed = $props();

	const chart = useChart();
	const embedded = useEmbedded();
	const strings = $derived(chart.locale.strings);

	let details = $state<HTMLDetailsElement>();
	let textarea = $state<HTMLTextAreaElement>();
	/** Read from the page when the code is opened: URLs need the page's address, defaults its title and height. */
	let page = $state<{ base: string; title: string; height?: number }>();
	let copied = $state(false);

	const url = (path: string) => (page ? new URL(path, page.base).href : path);
	const code = $derived(
		embedCode({
			src: url(src),
			title: title ?? page?.title ?? '',
			scriptSrc: scriptSrc && url(scriptSrc),
			height: height ?? page?.height
		})
	);

	function read() {
		if (!details?.open) return;
		const figure = details.closest('.mz-chart');
		// The embed page shows the chart without this control: measure down to what comes before it.
		const above = details.previousElementSibling;
		page = {
			base: document.baseURI,
			title: document.getElementById(chart.ids.title)?.textContent?.trim() ?? '',
			height:
				figure && above
					? Math.ceil(above.getBoundingClientRect().bottom - figure.getBoundingClientRect().top)
					: undefined
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
</script>

{#if chart.medium !== 'print' && !embedded}
	<details class="mz-embed-code" bind:this={details} ontoggle={read}>
		<summary>{strings.embed}</summary>
		<div class="mz-embed-code-body">
			<textarea
				bind:this={textarea}
				readonly
				rows="4"
				spellcheck="false"
				aria-label={strings.embedCode}
				value={code}
				onfocus={(e) => e.currentTarget.select()}></textarea>
			<div class="mz-embed-code-actions">
				<button type="button" onclick={copy}>{strings.copy}</button>
				<span role="status">{copied ? strings.copied : ''}</span>
			</div>
		</div>
	</details>
{/if}

<style>
	.mz-embed-code {
		font-family: var(--mz-font-label);
		font-size: var(--mz-size-small);
		color: var(--mz-color-muted);
	}
	summary {
		width: fit-content;
		font-weight: var(--mz-weight-strong);
		cursor: pointer;
	}
	summary:focus-visible,
	button:focus-visible,
	textarea:focus-visible {
		outline: 2px solid var(--mz-color-accent);
		outline-offset: 2px;
	}
	.mz-embed-code-body {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: 0.5rem;
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
	.mz-embed-code-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	button {
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
