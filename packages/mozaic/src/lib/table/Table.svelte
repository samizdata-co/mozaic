<!--
@component
A data table with sortable columns, locale-aware formatting, optional search
and a "show all" toggle, plus inline bar, heat and sparkline cells. Use it
on its own or inside `<Chart>`.
-->
<script lang="ts" generics="T">
	import { untrack } from 'svelte';
	import { ascending, descending, max as d3max } from 'd3-array';
	import { useChart } from '../core/context.js';
	import Sparkline from './Sparkline.svelte';
	import type { Column } from './types.js';

	interface Props {
		data: T[];
		columns: Column<T>[];
		/** Initial sort column key. */
		sortBy?: string;
		sortDirection?: 'ascending' | 'descending';
		/** Show a search box. */
		search?: boolean;
		/** Rows shown before "Show all". */
		maxRows?: number;
		/** Visible caption (also the accessible name). */
		caption?: string;
		stickyHeader?: boolean;
		class?: string;
	}

	let {
		data,
		columns,
		sortBy,
		sortDirection = 'descending',
		search = false,
		maxRows,
		caption,
		stickyHeader = false,
		class: className = ''
	}: Props = $props();

	const chart = useChart();
	const strings = $derived(chart.locale.strings);

	// Sort state starts from the props, then follows the reader's clicks.
	let sortKey = $state<string | undefined>(untrack(() => sortBy));
	let direction = $state<'ascending' | 'descending'>(untrack(() => sortDirection));
	let query = $state('');
	let expanded = $state(false);

	const isNumeric = (c: Column<T>) => data.some((d) => typeof c.value(d) === 'number');
	// Bars and sparklines start at the left edge, so their headers do too.
	const align = (c: Column<T>) =>
		c.align ?? (isNumeric(c) && c.type !== 'sparkline' && c.type !== 'bar' ? 'right' : 'left');
	const maxima = $derived(
		Object.fromEntries(columns.map((c) => [c.key, c.max ?? (d3max(data, (d) => Math.abs(Number(c.value(d)))) || 1)]))
	);

	const filtered = $derived.by(() => {
		const q = query.trim().toLocaleLowerCase(chart.locale.lang);
		if (!q) return data;
		const searchable = columns.filter((c) => c.searchable ?? !isNumeric(c));
		return data.filter((d) =>
			searchable.some((c) =>
				String(c.value(d) ?? '')
					.toLocaleLowerCase(chart.locale.lang)
					.includes(q)
			)
		);
	});

	const sorted = $derived.by(() => {
		const column = columns.find((c) => c.key === sortKey);
		if (!column) return filtered;
		const compare = direction === 'ascending' ? ascending : descending;
		return filtered.toSorted((a, b) => {
			const va = column.value(a);
			const vb = column.value(b);
			if (typeof va === 'string' && typeof vb === 'string')
				return (direction === 'ascending' ? 1 : -1) * va.localeCompare(vb, chart.locale.lang);
			return compare(va as number, vb as number);
		});
	});

	const visible = $derived(maxRows && !expanded ? sorted.slice(0, maxRows) : sorted);

	function toggleSort(column: Column<T>) {
		if (sortKey === column.key) direction = direction === 'ascending' ? 'descending' : 'ascending';
		else {
			sortKey = column.key;
			direction = isNumeric(column) ? 'descending' : 'ascending';
		}
	}

	function text(column: Column<T>, d: T): string {
		const v = column.value(d);
		if (column.format) return column.format(v, d);
		if (typeof v === 'number') return chart.locale.number(v);
		if (v instanceof Date) return chart.locale.timeFormat('%e %b %Y')(v);
		return v == null ? '' : String(v);
	}

	function contrast(color: string): string {
		// Near-black or white text on a heat cell: whichever has the higher WCAG contrast ratio.
		const m = color.match(/^#([0-9a-f]{6})$/i);
		if (!m) return 'inherit';
		const n = parseInt(m[1], 16);
		const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
			const s = c / 255;
			return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
		});
		const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
		const dark = 0.0056; // luminance of #111111
		return (luminance + 0.05) / (dark + 0.05) >= 1.05 / (luminance + 0.05) ? '#111111' : '#ffffff';
	}
</script>

<div class="mz-table-wrap {className}">
	{#if search && chart.medium !== 'print'}
		<input
			class="mz-table-search"
			type="search"
			placeholder={strings.search}
			aria-label={strings.search}
			bind:value={query}
		/>
	{/if}
	<div class="mz-table-scroll">
		<table class="mz-table" class:sticky={stickyHeader}>
			{#if caption}<caption>{caption}</caption>{/if}
			<thead>
				<tr>
					{#each columns as column (column.key)}
						<th
							scope="col"
							style:width={column.width}
							style:text-align={align(column)}
							aria-sort={sortKey === column.key ? direction : undefined}
						>
							{#if column.sortable !== false && chart.medium !== 'print'}
								<button type="button" onclick={() => toggleSort(column)}>
									{column.label}<span class="mz-sort" aria-hidden="true"
										>{sortKey === column.key ? (direction === 'ascending' ? '▲' : '▼') : ''}</span
									>
								</button>
							{:else}
								{column.label}
							{/if}
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each visible as d}
					<tr>
						{#each columns as column, ci (column.key)}
							{@const v = column.value(d)}
							{#if column.type === 'heat' && column.color}
								{@const bg = column.color(v, d)}
								<td style:text-align={align(column)} style:background={bg} style:color={contrast(bg)}
									>{text(column, d)}</td
								>
							{:else if column.type === 'bar'}
								<td class="mz-bar-cell">
									<span
										class="mz-cell-bar"
										style:width="{(Math.abs(Number(v)) / maxima[column.key]) * 100}%"
										style:background={column.color?.(v, d) ?? chart.theme.palettes.categorical[0]}
									></span>
									<span class="mz-cell-value">{text(column, d)}</span>
								</td>
							{:else if column.type === 'sparkline' && column.series}
								<td><Sparkline values={column.series(d)} /></td>
							{:else if ci === 0}
								<th scope="row" style:text-align={align(column)}>{text(column, d)}</th>
							{:else}
								<td style:text-align={align(column)}>{text(column, d)}</td>
							{/if}
						{/each}
					</tr>
				{/each}
				{#if visible.length === 0}
					<tr><td colspan={columns.length} class="mz-empty">{strings.noData}</td></tr>
				{/if}
			</tbody>
		</table>
	</div>
	{#if maxRows && sorted.length > maxRows && chart.medium !== 'print'}
		<button class="mz-table-more" type="button" onclick={() => (expanded = !expanded)}>
			{expanded ? strings.showFewer : strings.showAll(sorted.length)}
		</button>
	{/if}
</div>

<style>
	.mz-table-wrap {
		font-family: var(--mz-font-body, system-ui, sans-serif);
		font-size: var(--mz-size-small, 0.8125rem);
		color: var(--mz-color-text, #1a1a1a);
	}
	.mz-table-scroll {
		overflow-x: auto;
	}
	.mz-table {
		width: 100%;
		border-collapse: collapse;
		font-variant-numeric: tabular-nums;
	}
	caption {
		text-align: left;
		font-weight: var(--mz-weight-strong, 700);
		padding-bottom: 0.375rem;
	}
	th,
	td {
		padding: 0.375rem 0.5rem;
		border-bottom: 1px solid var(--mz-color-grid, #e4e4e4);
		vertical-align: middle;
	}
	thead th {
		font-family: var(--mz-font-label, inherit);
		font-weight: var(--mz-weight-label, 700);
		text-transform: var(--mz-label-transform, none);
		letter-spacing: var(--mz-label-tracking, normal);
		color: var(--mz-color-muted, #5c5c5c);
		border-bottom: 1px solid var(--mz-color-text, #1a1a1a);
		white-space: nowrap;
	}
	tbody th {
		font-weight: var(--mz-weight-strong, 600);
	}
	.sticky thead th {
		position: sticky;
		top: 0;
		background: var(--mz-color-bg, #fff);
	}
	thead button {
		all: unset;
		cursor: pointer;
	}
	thead button:focus-visible {
		outline: 2px solid var(--mz-color-accent, #2a78d6);
	}
	.mz-sort {
		display: inline-block;
		width: 1em;
		font-size: 0.7em;
		text-align: center;
	}
	.mz-bar-cell {
		position: relative;
		min-width: 6rem;
	}
	.mz-cell-bar {
		position: absolute;
		left: 0.5rem;
		top: 25%;
		height: 50%;
		max-width: calc(100% - 1rem);
		border-radius: 0 min(var(--mz-radius, 2px), 2px) min(var(--mz-radius, 2px), 2px) 0;
		opacity: 0.35;
	}
	.mz-cell-value {
		position: relative;
	}
	.mz-empty {
		text-align: center;
		color: var(--mz-color-muted, #5c5c5c);
	}
	.mz-table-search,
	.mz-table-more {
		margin: 0.5rem 0;
		padding: 0.35rem 0.6rem;
		border: 1px solid var(--mz-color-border, #e4e4e4);
		border-radius: var(--mz-radius, 4px);
		background: var(--mz-color-bg, #fff);
		color: inherit;
		font: inherit;
	}
	.mz-table-more {
		cursor: pointer;
		font-family: var(--mz-font-label, inherit);
		font-weight: var(--mz-weight-label, 600);
		text-transform: var(--mz-control-transform, none);
		letter-spacing: var(--mz-control-tracking, normal);
	}
</style>
