<!--
@component
A segmented control for switching between views (e.g. "Total" / "Per capita").
Accessible as a radio group: arrow keys move between options. Hidden in print.

```svelte
<ButtonGroup label="Measure" options={[{ value: 'total', label: 'Total' }, { value: 'share', label: 'Share' }]} bind:value={measure} />
```
-->
<script lang="ts" generics="V extends string">
	import { useChart } from '../core/context.js';

	interface Props {
		options: { value: V; label: string }[];
		value: V;
		/** Accessible name for the group. */
		label: string;
		onchange?: (value: V) => void;
		class?: string;
	}

	let { options, value = $bindable(), label, onchange, class: className = '' }: Props = $props();

	const chart = useChart();
	let buttons: HTMLButtonElement[] = $state([]);

	function select(next: V, focus = false) {
		value = next;
		onchange?.(next);
		if (focus) buttons[options.findIndex((o) => o.value === next)]?.focus();
	}

	function onkeydown(event: KeyboardEvent, index: number) {
		const step =
			event.key === 'ArrowRight' || event.key === 'ArrowDown'
				? 1
				: event.key === 'ArrowLeft' || event.key === 'ArrowUp'
					? -1
					: 0;
		if (!step) return;
		event.preventDefault();
		select(options[(index + step + options.length) % options.length].value, true);
	}
</script>

{#if chart.medium !== 'print'}
	<div class="mz-button-group {className}" role="radiogroup" aria-label={label}>
		{#each options as option, i (option.value)}
			<button
				bind:this={buttons[i]}
				type="button"
				role="radio"
				aria-checked={option.value === value}
				tabindex={option.value === value ? 0 : -1}
				onclick={() => select(option.value)}
				onkeydown={(e) => onkeydown(e, i)}
			>
				{option.label}
			</button>
		{/each}
	</div>
{/if}

<style>
	.mz-button-group {
		display: inline-flex;
		/* Don't stretch inside flex columns such as <Header>. */
		align-self: flex-start;
		flex-wrap: wrap;
		gap: 2px;
		padding: 2px;
		border-radius: var(--mz-radius);
		background: var(--mz-color-grid);
		font-family: var(--mz-font-label);
	}
	button {
		padding: 0.3rem 0.75rem;
		border: 0;
		border-radius: var(--mz-radius);
		background: transparent;
		color: var(--mz-color-muted);
		font: inherit;
		font-size: var(--mz-size-small);
		font-weight: var(--mz-weight-label);
		text-transform: var(--mz-control-transform);
		letter-spacing: var(--mz-control-tracking);
		cursor: pointer;
	}
	/* The selected option is a filled control in the house accent. */
	button[aria-checked='true'] {
		background: var(--mz-color-accent);
		color: #ffffff;
	}
	button:focus-visible {
		outline: 2px solid var(--mz-color-accent);
		outline-offset: 3px;
	}
</style>
