import { describe, expect, it } from 'vitest';
import { tooltipLeft } from './tooltip-position.js';

const plot = { width: 400, padding: { left: 30, right: 80 } };

describe('tooltipLeft', () => {
	it('sits right of a point in the left part of the plot', () => {
		expect(tooltipLeft(100, 150, plot)).toBe(112);
	});

	it('sits left of a point in the right part of the plot', () => {
		expect(tooltipLeft(350, 150, plot)).toBe(188);
	});

	it('changes side when there is no room on the usual one', () => {
		// A point just left of the flip line, with no room on its right: the tooltip goes left.
		expect(tooltipLeft(170, 150, { width: 300, padding: { left: 0, right: 0 } })).toBe(8);
		// Neither side fits a 280px tooltip: it is pushed inside instead.
		expect(tooltipLeft(260, 280, { width: 300, padding: { left: 0, right: 0 } })).toBe(0);
	});

	it('never leaves the chart, padding included', () => {
		const narrow = { width: 150, padding: { left: 0, right: 150 } };
		const left = tooltipLeft(140, 180, narrow);
		expect(left).toBeGreaterThanOrEqual(0);
		expect(left + 180).toBeLessThanOrEqual(300);
	});
});
