import type { Column } from './types.js';

function escape(value: unknown): string {
	if (value == null) return '';
	const text = value instanceof Date ? value.toISOString().slice(0, 10) : String(value);
	return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** CSV text from rows and columns (raw values, not formatted). */
export function toCSV<T>(rows: T[], columns: Pick<Column<T>, 'label' | 'value'>[]): string {
	const header = columns.map((c) => escape(c.label)).join(',');
	const body = rows.map((d) => columns.map((c) => escape(c.value(d))).join(','));
	return [header, ...body].join('\n') + '\n';
}
