import { describe, expect, it } from 'vitest';
import { renderDocument } from './dom.js';
import {
	ArrowChart,
	BarChart,
	BarDotChart,
	ColumnChart,
	LineChart,
	MosaicChart,
	PercentileChart,
	ScatterChart,
	StackedBarChart,
	StripChart
} from '../lib/recipes/index.js';
import { EL, MD, RO } from '../lib/flags/index.js';

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

	it('BarChart: a range gets a lighter bar to the high end and a "low–high" label', () => {
		const data = [
			{ name: 'Chișinău', value: 30 },
			{ name: 'Bălți', value: 14, low: 12, high: 16 },
			{ name: 'Cahul', value: 8 }
		];
		type D = (typeof data)[number];
		const { $$ } = renderDocument(BarChart, {
			data,
			label: (d: D) => d.name,
			value: (d: D) => d.value,
			range: (d: D): [number, number] | null => (d.low != null && d.high != null ? [d.low, d.high] : null),
			format: (n: number) => String(n),
			width: 400
		});
		expect($$('.mz-bars-range path')).toHaveLength(1);
		expect(
			$$('.mz-text text')
				.map((t) => t.textContent?.trim())
				.sort()
		).toEqual(['12–16', '30', '8']);
		// The long bar holds its label; the range keeps its label outside, after the high end.
		const inside = $$('.mz-bar-value-inside text').map((t) => t.textContent?.trim());
		expect(inside).toContain('30');
		expect(inside).not.toContain('12–16');
	});

	it('BarChart: flags between the labels and the bars', () => {
		const { $$ } = renderDocument(BarChart, {
			data: rows,
			label: (d: (typeof rows)[number]) => d.name,
			value: (d: (typeof rows)[number]) => d.value,
			flag: (d: (typeof rows)[number]) => (d.name === 'Cahul' ? null : MD),
			width: 400
		});
		expect($$('.mz-flag')).toHaveLength(2);
		expect($$('.mz-flag clipPath circle')).toHaveLength(2);
		const ids = $$('.mz-flag clipPath').map((c) => c.id);
		expect(new Set(ids).size).toBe(2);
	});

	it('ScatterChart: flags instead of dots', () => {
		const data = [
			{ name: 'Moldova', geo: 'MD', x: 1, y: 2 },
			{ name: 'Romania', geo: 'RO', x: 2, y: 1 },
			{ name: 'Other', geo: 'XX', x: 3, y: 3 }
		];
		type D = (typeof data)[number];
		const flags: Record<string, string> = { MD, RO };
		const { $$ } = renderDocument(ScatterChart, {
			data,
			x: (d: D) => d.x,
			y: (d: D) => d.y,
			name: (d: D) => d.name,
			flag: (d: D) => flags[d.geo],
			width: 400
		});
		expect($$('.mz-flags .mz-flag')).toHaveLength(2);
		expect($$('.mz-points circle')).toHaveLength(1);
	});

	it('StripChart: one flag per item, labels for highlights, a reference line', () => {
		const data = [
			{ geo: 'MD', name: 'Moldova', value: 8.5 },
			{ geo: 'RO', name: 'România', value: 5.9 },
			{ geo: 'EL', name: 'Grecia', value: 7.7 },
			{ geo: 'XX', name: 'Fără steag', value: 6 }
		];
		type D = (typeof data)[number];
		const flags: Record<string, string> = { MD, RO, EL };
		const { $$ } = renderDocument(StripChart, {
			data,
			value: (d: D) => d.value,
			label: (d: D) => d.name,
			flag: (d: D) => flags[d.geo],
			highlight: (d: D) => d.geo === 'MD' || d.geo === 'RO',
			emphasize: (d: D) => d.geo === 'MD',
			references: [{ value: 11, label: 'Media UE: 11' }],
			format: (n: number) => String(n),
			width: 500
		});
		expect($$('.mz-flag')).toHaveLength(3);
		expect($$('circle[r]').filter((c) => c.closest('.mz-flag') == null && c.getAttribute('fill'))).toHaveLength(1);
		const labels = $$('.mz-strip-label');
		expect(labels.map((t) => t.textContent)).toEqual(['România 5.9', 'Moldova 8.5']);
		expect(labels.map((t) => (t.getAttribute('style') ?? '').includes('font-weight'))).toEqual([false, true]);
		expect($$('.mz-strip-ref-label').map((t) => t.textContent)).toEqual(['Media UE: 11']);
	});

	it('the last tick label of each value axis carries the unit', () => {
		const data = [
			{ name: 'A', x: 1, y: 2 },
			{ name: 'B', x: 9, y: 18 }
		];
		type D = (typeof data)[number];
		const scatter = renderDocument(ScatterChart, {
			data,
			x: (d: D) => d.x,
			y: (d: D) => d.y,
			name: (d: D) => d.name,
			xUnit: 'euro',
			yUnit: 'c/kWh',
			width: 500
		});
		const xs = scatter.$$('.mz-axis-x .mz-tick text').map((t) => t.textContent?.trim());
		expect(xs.at(-1)).toMatch(/ euro$/);
		expect(xs.filter((t) => t?.includes('euro'))).toHaveLength(1);
		expect(
			scatter
				.$$('.mz-axis-y')
				.map((g) => g.textContent)
				.join(' ')
		).toContain('c/kWh');
		const strip = renderDocument(StripChart, {
			data,
			value: (d: D) => d.x,
			label: (d: D) => d.name,
			unit: 'c/kWh',
			width: 500
		});
		expect(
			strip
				.$$('.mz-axis-x .mz-tick text')
				.map((t) => t.textContent?.trim())
				.at(-1)
		).toMatch(/ c\/kWh$/);
	});

	it('ScatterChart: emphasized labels are bold', () => {
		const data = [{ name: 'A', x: 1, y: 1 }];
		type D = (typeof data)[number];
		const { $$ } = renderDocument(ScatterChart, {
			data,
			x: (d: D) => d.x,
			y: (d: D) => d.y,
			name: (d: D) => d.name,
			labelled: () => true,
			emphasize: () => true,
			width: 400
		});
		expect(
			$$('.mz-label text, text.mz-label').some((t) => (t.getAttribute('style') ?? '').includes('font-weight'))
		).toBe(true);
	});

	it('ScatterChart: quadrants draw two dividing lines and a label per corner', () => {
		const data = [
			{ name: 'A', x: 1, y: 1 },
			{ name: 'B', x: 9, y: 9 }
		];
		type D = (typeof data)[number];
		const { $$ } = renderDocument(ScatterChart, {
			data,
			x: (d: D) => d.x,
			y: (d: D) => d.y,
			name: (d: D) => d.name,
			xDomain: [0, 10],
			yDomain: [0, 10],
			quadrants: { x: 5, y: 5, xLabel: 'Average', topLeft: 'Poorer,\nmore expensive', bottomRight: 'Richer, cheaper' },
			width: 500
		});
		expect($$('.mz-ref-line')).toHaveLength(2);
		expect($$('.mz-quadrant').map((t) => [...t.querySelectorAll('tspan')].map((s) => s.textContent))).toEqual([
			['Poorer,', 'more expensive'],
			['Richer, cheaper']
		]);
	});

	it('ScatterChart: axis arrows replace quarter labels that do not fit', () => {
		const data = [
			{ name: 'A', x: 1, y: 1 },
			{ name: 'B', x: 9, y: 9 }
		];
		type D = (typeof data)[number];
		const props = {
			data,
			x: (d: D) => d.x,
			y: (d: D) => d.y,
			name: (d: D) => d.name,
			xDomain: [0, 10] as [number, number],
			yDomain: [0, 10] as [number, number],
			quadrants: { x: 5, y: 5, topLeft: 'Lower incomes,\nmore expensive gas' },
			directions: { x: ['Poorer', 'Richer'] as [string, string] }
		};
		const wide = renderDocument(ScatterChart, { ...props, width: 900 });
		expect(wide.$$('.mz-quadrant')).toHaveLength(1);
		expect(wide.$$('.mz-direction')).toHaveLength(0);
		const narrow = renderDocument(ScatterChart, { ...props, width: 240 });
		expect(narrow.$$('.mz-quadrant')).toHaveLength(0);
		expect(narrow.$$('.mz-direction').map((t) => t.textContent)).toEqual(['← Poorer', 'Richer →']);
	});

	it('StripChart: arrows for what each end means, soft gridlines', () => {
		const data = [
			{ name: 'A', value: 2 },
			{ name: 'B', value: 8 }
		];
		type D = (typeof data)[number];
		const { $$ } = renderDocument(StripChart, {
			data,
			value: (d: D) => d.value,
			label: (d: D) => d.name,
			directions: ['Cheaper', 'Dearer'],
			width: 500
		});
		expect($$('.mz-strip-direction').map((t) => t.textContent)).toEqual(['← Cheaper', 'Dearer →']);
		expect($$('.mz-strip-grid').length).toBeGreaterThan(2);
	});

	it('source: text, or linked sources joined with "; " (plain text in print)', () => {
		const props = {
			data: rows,
			label: (d: (typeof rows)[number]) => d.name,
			value: (d: (typeof rows)[number]) => d.value,
			width: 400,
			locale: 'en'
		};
		const squash = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim();
		const sources = [{ label: 'ANRE', href: 'https://anre.md/' }, { label: 'BNM' }];
		const text = renderDocument(BarChart, { ...props, source: 'Src' });
		expect(squash(text.$('.mz-source')!.textContent)).toBe('Source: Src');
		const web = renderDocument(BarChart, { ...props, source: sources });
		expect(squash(web.$('.mz-source')!.textContent)).toBe('Sources: ANRE; BNM');
		expect(
			web.$$('.mz-source a').map((a) => [a.textContent, a.getAttribute('href'), a.getAttribute('target')])
		).toEqual([['ANRE', 'https://anre.md/', '_blank']]);
		const print = renderDocument(BarChart, { ...props, source: sources, medium: 'print' });
		expect(print.$$('.mz-source a')).toHaveLength(0);
		expect(squash(print.$('.mz-source')!.textContent)).toBe('Sources: ANRE; BNM');
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

	it('StackedBarChart: a row label with a line break is drawn as two lines, centred on the tick', () => {
		const label = (area: string) => (area === 'Abroad' ? 'Abroad\n(postal)' : area);
		const { $$ } = renderDocument(StackedBarChart, { ...voteProps, row: (d: Vote) => label(d.area), width: 600 });
		const tick = $$('.mz-axis-y text').find((t) => t.textContent?.includes('Abroad'));
		expect(tick?.textContent).toBe('Abroad(postal)');
		expect([...(tick?.querySelectorAll('tspan') ?? [])].map((t) => t.textContent)).toEqual(['(postal)']);
		expect(tick?.getAttribute('dy')).toBe(`${0.32 - 1.15 / 2}em`);
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

	it('PercentileChart: a strip per group, a "you" line and a percentile readout per group', () => {
		const groups = [
			{
				name: 'Housing officers',
				points: [
					{ p: 25, value: 30000 },
					{ p: 50, value: 34000 },
					{ p: 75, value: 40000 }
				]
			},
			{
				name: 'All employees',
				points: [
					{ p: 10, value: 20000 },
					{ p: 50, value: 40000 },
					{ p: 90, value: 80000 }
				]
			}
		];
		type G = (typeof groups)[number];
		const { $, $$ } = renderDocument(PercentileChart, {
			data: groups,
			label: (d: G) => d.name,
			percentiles: (d: G) => d.points,
			highlight: (d: G) => d.name === 'Housing officers',
			value: 37000,
			inputLabel: 'Your salary',
			readoutLabel: 'More than',
			summary: (r: { percentile: number }, d: G) => `More than ${Math.round(r.percentile)}% of ${d.name}`,
			medianLabel: 'Median',
			width: 500
		});
		expect($$('.mz-percentile-name').map((t) => t.textContent)).toEqual(['Housing officers', 'All employees']);
		// 37,000 is halfway from the median to p75 (62.5%) and 85% of the way from p10 to the median (44%).
		expect($$('.mz-percentile-readout').map((t) => t.textContent)).toEqual(['63%', '44%']);
		expect($('.mz-percentile-summary')!.textContent).toBe('More than 63% of Housing officers');
		expect($('.mz-percentile-you-label')!.textContent).toBe('37,000');
		expect($('.mz-percentile-heading')!.textContent).toBe('More than');
		expect($$('.mz-percentile-row.on')).toHaveLength(1);
		expect($('.mz-percentile-controls input[type=number]')!.getAttribute('value')).toBe('37000');
	});

	it('PercentileChart: starts at the highlighted median, flags values off the range, hides controls in print', () => {
		const groups = [
			{
				name: 'A',
				points: [
					{ p: 25, value: 10 },
					{ p: 50, value: 20 },
					{ p: 75, value: 30 }
				]
			},
			{
				name: 'B',
				points: [
					{ p: 25, value: 30 },
					{ p: 50, value: 40 },
					{ p: 75, value: 50 }
				]
			}
		];
		type G = (typeof groups)[number];
		const { $, $$ } = renderDocument(PercentileChart, {
			data: groups,
			label: (d: G) => d.name,
			percentiles: (d: G) => d.points,
			highlight: (d: G) => d.name === 'B',
			medium: 'print',
			width: 400
		});
		expect($('.mz-percentile-you-label')!.textContent).toBe('40');
		expect($$('.mz-percentile-readout').map((t) => t.textContent)).toEqual(['>75%', '50%']);
		expect($('.mz-percentile-controls')).toBeNull();
	});
});
