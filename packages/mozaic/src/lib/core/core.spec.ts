import { describe, expect, it } from 'vitest';
import { scaleBand, scaleLinear } from 'd3-scale';
import { geoMercator } from 'd3-geo';
import { access, estimateTextWidth, isOrdinal, isScale, mm, position, pt, scaled, type PlotContext } from './index.js';

describe('scales', () => {
	it('detects scales and ordinal scales', () => {
		expect(isScale(scaleLinear())).toBe(true);
		expect(isScale(() => 1)).toBe(false);
		expect(isOrdinal(scaleBand())).toBe(true);
		expect(isOrdinal(scaleLinear())).toBe(false);
	});

	it('returns band centres for band scales', () => {
		const band = scaleBand().domain(['a', 'b']).range([0, 100]);
		expect(scaled(band, 'a')).toBe(25);
		expect(scaled(band, 'b', 0)).toBe(50);
		expect(scaled(band, 'missing')).toBeNaN();
		expect(scaled(scaleLinear().range([0, 10]), 0.5)).toBe(5);
	});

	it('positions through the projection when there is one', () => {
		const plot = { x: scaleLinear(), y: scaleLinear(), projection: undefined } as unknown as PlotContext;
		expect(position(plot, 0.5, 0.25)).toEqual([0.5, 0.25]);
		const projection = geoMercator().scale(100).translate([0, 0]);
		const projected = { ...plot, projection } as unknown as PlotContext;
		expect(position(projected, 0, 0)).toEqual([0, 0]);
	});

	it('estimates text width deterministically', () => {
		expect(estimateTextWidth('abcd', 10)).toBeCloseTo(22.4);
	});
});

describe('units and accessors', () => {
	it('converts print units', () => {
		expect(mm(25.4)).toBeCloseTo(96);
		expect(pt(72)).toBeCloseTo(96);
	});

	it('accepts constants or functions', () => {
		expect(access(5, {}, 0)).toBe(5);
		expect(access((d: { v: number }, i) => d.v + i, { v: 2 }, 1)).toBe(3);
	});
});
