<!--
@component
A collapsed "Show the data" table under the chart, so the values are
available to screen readers and anyone who wants the numbers. Hidden in print.
-->
<script lang="ts" generics="T">
	import { useChart } from '../core/context.js';
	import Table from '../table/Table.svelte';
	import type { Column } from '../table/types.js';

	let { data, columns, maxRows }: { data: T[]; columns: Column<T>[]; maxRows?: number } = $props();

	const chart = useChart();
</script>

{#if chart.medium !== 'print'}
	<details class="mz-data-table">
		<summary>{chart.locale.strings.showData}</summary>
		<Table {data} {columns} {maxRows} />
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
