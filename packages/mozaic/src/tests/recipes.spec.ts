import { describe, expect, it } from 'vitest';
import { renderDocument } from './dom.js';
import {
	ArrowChart,
	BarChart,
	BarDotChart,
	ColumnChart,
	LineChart,
	MosaicChart,
	ScatterChart,
	StackedBarChart
} from '../lib/recipes/index.js';

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
			width: 400,
			embed: { src: '/embed/bars/en/' }
		});
		expect($$('.mz-bars path')).toHaveLength(3);
		expect($('.mz-title')!.textContent).toBe('Bar title');
		expect($('.mz-chart-tools .mz-tool')!.getAttribute('aria-label')).toBe('Embed');
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
	const votes = [
		{ area: 'North', who: 'Ana', n: 60 },
		{ area: 'North', who: 'Ion', n: 40 },
		{ area: 'South', who: 'Ana', n: 10 },
		{ area: 'South', who: 'Ion', n: 290 },
		{ area: 'Abroad', who: 'Ana', n: 90 },
		{ area: 'Abroad', who: 'Ion', n: 10 }
	];
	type Vote = (typeof votes)[number];
	const voteProps = {
		data: votes,
		row: (d: Vote) => d.area,
		series: (d: Vote) => d.who,
		value: (d: Vote) => d.n
	};

	it('StackedBarChart: shares per row, labels that fit, brackets and a reference line', () => {
		const { $$ } = renderDocument(StackedBarChart, {
			...voteProps,
			data: votes.filter((d) => d.area !== 'South'),
			groups: [{ label: 'Left', from: 'Ana', to: 'Ana' }],
			reference: 0.5,
			width: 600
		});
		expect($$('.mz-rects rect')).toHaveLength(4);
		expect($$('.mz-legend li')).toHaveLength(2);
		expect($$('.mz-stacked-label').map((t) => t.textContent?.replace(/\s+/g, ' ').trim())).toEqual([
			'Ana 60.0%',
			'Ana 90.0%',
			'Ion 40.0%',
			'Ion 10.0%'
		]);
		expect($$('.mz-stacked-bracket text').map((t) => t.textContent)).toEqual(['Left']);
		expect($$('.mz-ref-line line')).toHaveLength(1);
	});

	it('StackedBarChart: a single bar has no row axis, and segments under labelMin go unlabelled', () => {
		const { $$ } = renderDocument(StackedBarChart, {
			...voteProps,
			data: votes.filter((d) => d.area === 'Abroad'),
			labelMin: 0.2,
			width: 600
		});
		expect($$('.mz-axis-y')).toHaveLength(0);
		expect($$('.mz-stacked-label')).toHaveLength(1);
	});

	it('MosaicChart: rows as tall as their totals, sorted by a series share', () => {
		const { $$ } = renderDocument(MosaicChart, {
			...voteProps,
			sortBy: ['Ana'],
			labelSeries: ['Ion'],
			height: 500,
			width: 600
		});
		const rects = $$('.mz-rects rect');
		expect(rects).toHaveLength(6);
		expect($$('.mz-mosaic-row text').map((t) => t.textContent)).toEqual(['Abroad', 'North', 'South']);
		// South has 300 of 500 votes: 60% of the plot height.
		const south = rects.filter((r) => r.querySelector('title')?.textContent?.startsWith('South'));
		expect(Number(south[0].getAttribute('height'))).toBeCloseTo(300, 0);
		expect($$('.mz-mosaic-series').map((t) => t.textContent)).toEqual(['Ion']);
	});
});
