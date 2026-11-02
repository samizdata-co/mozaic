<!--
@component
The chart's data as a table, so the values are available to screen readers and anyone who wants the
numbers: a "Show the data" button among the icons under the chart opens it. Outside `<Chart>` it is a
collapsed "Show the data" section. Hidden in print.
-->
<script lang="ts" generics="T">
	import { onDestroy } from 'svelte';
	import { useChart } from '../core/context.js';
	import Table from '../table/Table.svelte';
	import type { Column } from '../table/types.js';

	let { data, columns, maxRows }: { data: T[]; columns: Column<T>[]; maxRows?: number } = $props();

	const chart = useChart();
	const tools = chart.tools;
	if (tools) {
		// Cast: a linked package can see another copy of svelte's Snippet type.
		tools.table = table as unknown as NonNullable<typeof tools.table>;
		onDestroy(() => {
			if (tools.table === table) tools.table = null;
		});
	}
</script>

{#snippet table()}
	<Table {data} {columns} {maxRows} />
{/snippet}

{#if chart.medium !== 'print' && !tools}
	<details class="mz-data-table">
		<summary>{chart.locale.strings.showData}</summary>
		{@render table()}
	</details>
{/if}

<style>
	.mz-data-table {
		font-size: var(--mz-size-small);
	}
	summary {
		cursor: pointer;
		color: var(--mz-color-muted);
		font-family: var(--mz-font-label);
		font-weight: var(--mz-weight-label);
		text-transform: var(--mz-label-transform);
		letter-spacing: var(--mz-label-tracking);
	}
</style>
