<!--
@component
A "Download the data (CSV)" link built from the chart's rows. Works without
JavaScript (the CSV is inlined as a data URL). Hidden in print.
-->
<script lang="ts" generics="T">
	import { useChart } from '../core/context.js';
	import { toCSV } from '../table/csv.js';
	import type { Column } from '../table/types.js';

	interface Props {
		data: T[];
		columns: Pick<Column<T>, 'label' | 'value'>[];
		/** File name without extension. */
		filename?: string;
	}

	let { data, columns, filename = 'data' }: Props = $props();

	const chart = useChart();
	const href = $derived(`data:text/csv;charset=utf-8,${encodeURIComponent('﻿' + toCSV(data, columns))}`);
</script>

{#if chart.medium !== 'print'}
	<a class="mz-data-download" {href} download="{filename}.csv">{chart.locale.strings.downloadData}</a>
{/if}

<style>
	.mz-data-download {
		color: var(--mz-color-muted);
		font-size: var(--mz-size-small);
		font-weight: var(--mz-weight-strong);
	}
</style>
