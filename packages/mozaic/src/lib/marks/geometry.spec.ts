import { describe, expect, it } from 'vitest';
import { barPath } from './bar-path.js';
import { calloutGeometry } from '../annotations/callout-geometry.js';

describe('barPath', () => {
	it('draws a square bar when the radius is 0', () => {
		expect(barPath('horizontal', 0, 100, 10, 30, 0)).toBe('M0,10H100Q100,10 100,10V30Q100,30 100,30H0Z');
	});

	it('limits the radius to half the thickness and the bar length', () => {
		const d = barPath('vertical', 100, 98, 0, 20, 8);
		// Length 2 caps the radius at 2.
		expect(d).toContain('Q0,98 2,98');
	});

	it('rounds the data end of negative bars', () => {
		expect(barPath('horizontal', 50, 10, 0, 10, 3)).toContain('H13Q10,0 10,3');
	});
});

describe('calloutGeometry', () => {
	it('starts below a label above the target and ends short of it', () => {
		const g = calloutGeometry({ tx: 100, ty: 100, lx: 100, ly: 50, top: 40, bottom: 55, anchor: 'middle', bend: 0 });
		expect(g.arrow.startsWith('M100,59')).toBe(true);
		expect(g.arrow).toMatch(/ 100,96$/);
		expect(g.head.split('L')).toHaveLength(3);
	});

	it('starts from the side facing the target for horizontal offsets', () => {
		const g = calloutGeometry({ tx: 0, ty: 0, lx: 80, ly: 5, top: -5, bottom: 8, anchor: 'start', bend: 0.3 });
		expect(g.arrow.startsWith('M76,')).toBe(true);
	});
});
