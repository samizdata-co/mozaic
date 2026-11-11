import { describe, expect, it } from 'vitest';
import { tickStride } from './ticks.js';

describe('tickStride', () => {
	it('labels every tick when they fit', () => {
		expect(tickStride([0, 100, 200], [40, 40, 40])).toBe(1);
	});

	it('labels every other tick when neighbours would overlap', () => {
		// Ticks 40 px apart with labels 40 px wide: adjacent ones touch, every other one has room.
		expect(tickStride([0, 40, 80, 120, 160], [40, 40, 40, 40, 40])).toBe(2);
	});

	it('goes further apart for crowded ticks', () => {
		const positions = [0, 20, 40, 60, 80, 100, 120, 140, 160];
		expect(
			tickStride(
				positions,
				positions.map(() => 40)
			)
		).toBe(3);
	});
});
