<script lang="ts">
	let { code, label = 'Code', lang = 'svelte' }: { code: string; label?: string; lang?: string } = $props();
	let copied = $state(false);

	async function copy() {
		await navigator.clipboard.writeText(code);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<div class="code">
	<div class="bar">
		<span>{label}</span>
		<button type="button" onclick={copy}>{copied ? 'Copied' : 'Copy'}</button>
	</div>
	<!-- Scrollable regions must be reachable by keyboard (axe: scrollable-region-focusable). -->
	<!-- eslint-disable-next-line svelte/no-unused-svelte-ignore -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<pre data-lang={lang} tabindex="0" aria-label={label}><code>{code}</code></pre>
</div>

<style>
	.code {
		border: 1px solid var(--docs-border);
		border-radius: 6px;
		overflow: hidden;
		background: var(--docs-code-bg);
	}
	.bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.35rem 0.75rem;
		border-bottom: 1px solid var(--docs-border);
		font-size: 0.75rem;
		color: var(--docs-muted);
	}
	button {
		font: inherit;
		padding: 0.15rem 0.5rem;
		border: 1px solid var(--docs-border);
		border-radius: 4px;
		background: var(--docs-bg);
		color: inherit;
		cursor: pointer;
	}
	pre {
		margin: 0;
		padding: 0.75rem;
		overflow: auto;
		max-height: 32rem;
		font-size: 0.8125rem;
		line-height: 1.5;
		tab-size: 2;
	}
</style>
