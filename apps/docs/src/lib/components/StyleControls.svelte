<script lang="ts">
	import { styles } from 'mozaic/styles';
	import { settings, saveSettings } from '../settings.svelte';
</script>

<div class="controls">
	<label>
		<span>Style</span>
		<select bind:value={settings.style} onchange={saveSettings}>
			{#each Object.entries(styles) as [name, theme] (name)}<option value={name}>{theme.label}</option>{/each}
		</select>
	</label>
	<label>
		<span>Language</span>
		<select bind:value={settings.locale} onchange={saveSettings}>
			<option value="en">English</option>
			<option value="ro">Română</option>
			<option value="ru">Русский</option>
		</select>
	</label>
</div>

<style>
	.controls {
		display: flex;
		gap: 0.75rem;
	}
	label {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.8125rem;
	}
	span {
		color: var(--docs-muted);
	}
	select {
		font: inherit;
		padding: 0.2rem 0.35rem;
		border: 1px solid var(--docs-border);
		border-radius: 4px;
		background: var(--docs-bg);
		color: inherit;
	}
</style>
