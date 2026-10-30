import { describe, expect, it } from 'vitest';
import { renderDocument } from './dom.js';
import { ArrowChart, BarChart, BarDotChart, ColumnChart, LineChart, ScatterChart } from '../lib/recipes/index.js';

const rows = [
	{ name: 'Chișinău', value: 30 },
	{ name: 'Bălți', value: 12 },
	{ name: 'Cahul', value: 8 }
];

describe('recipes', () => {
	it('BarChart: sorted bars with value labels and frame', () => {
		const { $, $$ } = renderDocument(BarChart, {
			data: rows,
			label: (d: (typeof rows)[number]) => d.name,
			value: (d: (typeof rows)[number]) => d.value,
			title: 'Bar title',
			source: 'Src',
			width: 400
		});
		expect($$('.mz-bars path')).toHaveLength(3);
		expect($('.mz-title')!.textContent).toBe('Bar title');
		expect($$('.mz-axis-y text').map((t) => t.textContent?.trim())).toEqual(['Chișinău', 'Bălți', 'Cahul']);
		expect($$('.mz-text text').map((t) => t.textContent?.trim())).toContain('30');
	});

	it('ColumnChart: one column per category', () => {
		const { $$ } = renderDocument(ColumnChart, {
			data: rows,
			label: (d: (typeof rows)[number]) => d.name,
			value: (d: (typeof rows)[number]) => d.value,
			width: 400
		});
		expect($$('.mz-bars path')).toHaveLength(3);
	});

	it('LineChart: a line, legend entry and end label per series', () => {
		const series = ['North', 'South'].map((name, k) => ({
			name,
			values: [0, 1, 2].map((m) => ({ date: new Date(2024, m, 1), value: m + k }))
		}));
		const { $$ } = renderDocument(LineChart, {
			series,
			points: (s: (typeof series)[number]) => s.values,
			name: (s: (typeof series)[number]) => s.name,
			x: (p: { date: Date }) => p.date,
			y: (p: { value: number }) => p.value,
			width: 500
		});
		expect($$('.mz-line')).toHaveLength(2);
		expect($$('.mz-legend li')).toHaveLength(2);
		expect($$('.mz-line-end-labels text').map((t) => t.textContent)).toEqual(['North', 'South']);
	});

	it('ScatterChart: one dot per datum, labels for selected points', () => {
		const data = [
			{ n: 'a', x: 1, y: 2 },
			{ n: 'b', x: 2, y: 3 },
			{ n: 'c', x: 3, y: 1 }
		];
		const { $$ } = renderDocument(ScatterChart, {
			data,
			x: (d: (typeof data)[number]) => d.x,
			y: (d: (typeof data)[number]) => d.y,
			name: (d: (typeof data)[number]) => d.n,
			labelled: (d: (typeof data)[number]) => d.n === 'b',
			width: 400
		});
		expect($$('.mz-points circle')).toHaveLength(3);
		expect($$('.mz-label text').map((t) => t.textContent)).toEqual(['b']);
	});
	const waves = [
		{ name: 'Ana', before: 32.4, after: 29.2 },
		{ name: 'Ion', before: 3.2, after: 11.6 },
		{ name: 'Eva', before: undefined, after: 1.2 },
		{ name: 'Dan', before: 11.2, after: undefined }
	];
	type Wave = (typeof waves)[number];

	it('ArrowChart: arrows for complete rows, dots for the rest, end values and date labels', () => {
		const { $$ } = renderDocument(ArrowChart, {
			data: waves,
			label: (d: Wave) => d.name,
			start: (d: Wave) => d.before,
			end: (d: Wave) => d.after,
			startLabel: 'Sept',
			endLabel: 'Oct',
			format: (n: number) => `${n}%`,
			width: 400
		});
		expect($$('.mz-arrows-head')).toHaveLength(2);
		expect($$('.mz-arrow-dot-end')).toHaveLength(1);
		expect($$('.mz-arrow-dot-start')).toHaveLength(1);
		expect($$('.mz-arrow-value').map((t) => t.textContent)).toEqual(['29.2%', '11.6%', '1.2%', '11.2%']);
		expect($$('.mz-arrow-date').map((t) => t.textContent)).toEqual(['Sept', 'Oct']);
	});

	it('ArrowChart: a value that would cross the left edge goes beside the other end', () => {
		const { $ } = renderDocument(ArrowChart, {
			data: [{ name: 'Low', before: 8, after: 0.2 }],
			label: (d: { name: string }) => d.name,
			start: (d: { before: number }) => d.before,
			end: (d: { after: number }) => d.after,
			domain: [0, 10],
			width: 400
		});
		expect($('.mz-arrow-value')!.getAttribute('text-anchor')).toBe('start');
	});

	it('BarDotChart: a bar per latest value, a dot per earlier one, value and change', () => {
		const { $$ } = renderDocument(BarDotChart, {
			data: waves,
			label: (d: Wave) => d.name,
			value: (d: Wave) => d.after,
			previous: (d: Wave) => d.before,
			valueLabel: 'October',
			previousLabel: 'September',
			width: 400
		});
		expect($$('.mz-bars path')).toHaveLength(3);
		expect($$('.mz-points circle')).toHaveLength(3);
		expect($$('.mz-legend li')).toHaveLength(2);
		expect($$('.mz-bar-dot-value').map((t) => t.textContent?.replace(/\s+/g, ' ').trim())).toEqual([
			'29.2 −3.2',
			'11.6 +8.4',
			'1.2',
			'–'
		]);
	});
});
