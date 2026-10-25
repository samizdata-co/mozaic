import { describe, expect, it } from 'vitest';
import { renderDocument } from './dom.js';
import { BarChart, ColumnChart, LineChart, ScatterChart } from '../lib/recipes/index.js';

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
});
