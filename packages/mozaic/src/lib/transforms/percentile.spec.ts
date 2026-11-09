import { describe, expect, it } from 'vitest';
import { percentileRank } from './index.js';

const pay = [
	{ p: 10, value: null },
	{ p: 25, value: 30000 },
	{ p: 50, value: 34000 },
	{ p: 75, value: 40000 },
	{ p: 90, value: undefined }
];

describe('percentileRank', () => {
	it('interpolates between neighbouring points', () => {
		expect(percentileRank(32000, pay)).toEqual({ percentile: 37.5, below: false, above: false });
		expect(percentileRank(37000, pay)!.percentile).toBeCloseTo(62.5);
	});

	it('returns published points exactly', () => {
		expect(percentileRank(34000, pay)!.percentile).toBe(50);
		expect(percentileRank(40000, pay)).toEqual({ percentile: 75, below: false, above: false });
	});

	it('flags values outside the published range and skips missing points', () => {
		expect(percentileRank(20000, pay)).toEqual({ percentile: 25, below: true, above: false });
		expect(percentileRank(50000, pay)).toEqual({ percentile: 75, below: false, above: true });
	});

	it('takes the highest percentile of a run of equal values', () => {
		const flat = [
			{ p: 25, value: 10 },
			{ p: 50, value: 10 },
			{ p: 75, value: 20 }
		];
		expect(percentileRank(10, flat)!.percentile).toBe(50);
	});

	it('sorts points and returns undefined with nothing to go on', () => {
		expect(percentileRank(35000, pay.toReversed())!.percentile).toBeCloseTo(50 + (1000 / 6000) * 25);
		expect(percentileRank(1, [{ p: 50, value: null }])).toBeUndefined();
		expect(percentileRank(Number.NaN, pay)).toBeUndefined();
	});
});
