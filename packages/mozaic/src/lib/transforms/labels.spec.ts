import { describe, expect, it } from 'vitest';
import { avoidOverlap } from './labels.js';

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
