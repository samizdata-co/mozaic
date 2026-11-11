import { describe, expect, it } from 'vitest';
import { avoidOverlap, wrapLabel } from './labels.js';

describe('avoidOverlap', () => {
	it('leaves well-spaced labels alone', () => {
		expect(avoidOverlap([10, 50, 90], 12)).toEqual([10, 50, 90]);
	});

	it('pushes overlapping labels apart and keeps the original order', () => {
		const result = avoidOverlap([52, 50, 51], 10);
		expect(result).toEqual([70, 50, 60]);
		const sorted = [...result].sort((a, b) => a - b);
		for (let k = 1; k < sorted.length; k++) expect(sorted[k] - sorted[k - 1]).toBeGreaterThanOrEqual(10);
	});

	it('shifts labels back up when they would pass the bottom bound', () => {
		const result = avoidOverlap([95, 96, 97], 10, [0, 100]);
		expect(Math.max(...result)).toBe(100);
		expect(Math.min(...result)).toBe(80);
	});
});

describe('avoidOverlap with sizes', () => {
	it('keeps a two-line label further from its neighbours', () => {
		const result = avoidOverlap([50, 52], 10, [0, 100], [2, 1]);
		expect(result[1] - result[0]).toBe(15);
	});

	it('keeps the whole of a two-line label above the bottom bound', () => {
		const result = avoidOverlap([100], 10, [0, 100], [2]);
		expect(result[0]).toBe(95);
	});
});

describe('wrapLabel', () => {
	const measure = (s: string) => s.length * 6;

	it('leaves a label that fits on one line', () => {
		expect(wrapLabel('PAS 39%', 100, measure)).toEqual(['PAS 39%']);
	});

	it('breaks a long label at spaces', () => {
		expect(wrapLabel('Au auzit de ea 86%', 60, measure)).toEqual(['Au auzit', 'de ea 86%']);
	});

	it('keeps a word wider than the room whole', () => {
		expect(wrapLabel('Neîncrezători 12%', 30, measure)).toEqual(['Neîncrezători', '12%']);
	});
});
