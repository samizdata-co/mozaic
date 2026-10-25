import { describe, expect, it } from 'vitest';
import { sum } from 'd3-array';
import { bin, dodge, groupBy, indexTo, rollup, stack, treemapLayout } from './index.js';

const rows = [
	{ year: 2020, party: 'A', seats: 10 },
	{ year: 2020, party: 'B', seats: 5 },
	{ year: 2021, party: 'A', seats: 8 },
	{ year: 2021, party: 'B', seats: 12 }
];

describe('stack', () => {
	it('stacks long-format rows by key and series', () => {
		const result = stack(rows, { key: (d) => d.year, series: (d) => d.party, value: (d) => d.seats });
		expect(result).toHaveLength(4);
		const b2021 = result.find((r) => r.key === 2021 && r.series === 'B')!;
		expect([b2021.start, b2021.end]).toEqual([8, 20]);
		expect(b2021.datum).toBe(rows[3]);
	});

	it('normalises with offset "expand"', () => {
		const result = stack(rows, { key: (d) => d.year, series: (d) => d.party, value: (d) => d.seats, offset: 'expand' });
		const top = result.filter((r) => r.series === 'B').map((r) => r.end);
		expect(top).toEqual([1, 1]);
	});

	it('respects an explicit series order', () => {
		const result = stack(rows, {
			key: (d) => d.year,
			series: (d) => d.party,
			value: (d) => d.seats,
			seriesOrder: ['B', 'A']
		});
		const a2020 = result.find((r) => r.key === 2020 && r.series === 'A')!;
		expect(a2020.start).toBe(5);
	});

	it('stacks negatives below zero with offset "diverging"', () => {
		const data = [
			{ k: 'x', s: 'pos', v: 3 },
			{ k: 'x', s: 'neg', v: -2 }
		];
		const result = stack(data, { key: (d) => d.k, series: (d) => d.s, value: (d) => d.v, offset: 'diverging' });
		expect(result.find((r) => r.series === 'neg')).toMatchObject({ start: 0, end: -2 });
	});
});

describe('bin', () => {
	it('counts values per bin', () => {
		const bins = bin([1, 2, 2, 3, 9], (d) => d, { thresholds: [0, 5, 10], domain: [0, 10] });
		expect(bins.map((b) => b.count)).toEqual([4, 1]);
		expect(bins[0]).toMatchObject({ x0: 0, x1: 5 });
	});
});

describe('groupBy / rollup / indexTo', () => {
	it('groups and reduces', () => {
		expect(groupBy(rows, (d) => d.party).map((g) => g.values.length)).toEqual([2, 2]);
		expect(
			rollup(
				rows,
				(d) => d.party,
				(v) => sum(v, (d) => d.seats)
			)
		).toEqual([
			{ key: 'A', value: 18 },
			{ key: 'B', value: 17 }
		]);
	});

	it('rebases a series to 100', () => {
		expect(indexTo([{ v: 50 }, { v: 75 }], (d) => d.v).map((d) => d.index)).toEqual([100, 150]);
	});
});

describe('dodge', () => {
	it('keeps isolated points on the axis', () => {
		expect(dodge([0, 100, 200], 4)).toEqual([0, 0, 0]);
	});

	it('separates coincident points so circles do not overlap', () => {
		const ys = dodge([50, 50, 50], 4, { padding: 0 });
		expect(new Set(ys).size).toBe(3);
		for (let i = 0; i < ys.length; i++)
			for (let j = i + 1; j < ys.length; j++) expect(Math.abs(ys[i] - ys[j])).toBeGreaterThanOrEqual(8 - 1e-6);
	});

	it('only offsets upwards with side "positive"', () => {
		expect(Math.min(...dodge([10, 10, 10, 10], 3, { side: 'positive' }))).toBeGreaterThanOrEqual(0);
	});
});

describe('treemapLayout', () => {
	it('fills the area with one cell per row', () => {
		const data = [{ v: 6 }, { v: 3 }, { v: 1 }];
		const cells = treemapLayout(data, { value: (d) => d.v, width: 100, height: 100, padding: 0 });
		expect(cells).toHaveLength(3);
		const area = sum(cells, (c) => (c.x1 - c.x0) * (c.y1 - c.y0));
		expect(area).toBeCloseTo(10000, -2);
		expect(cells.every((c) => c.x0 >= 0 && c.y0 >= 0 && c.x1 <= 100 && c.y1 <= 100)).toBe(true);
	});

	it('assigns groups', () => {
		const data = [
			{ g: 'a', v: 1 },
			{ g: 'b', v: 2 }
		];
		const cells = treemapLayout(data, { value: (d) => d.v, group: (d) => d.g, width: 50, height: 50 });
		expect(cells.map((c) => c.group).sort()).toEqual(['a', 'b']);
	});
});
