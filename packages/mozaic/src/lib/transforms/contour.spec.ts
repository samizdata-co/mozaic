import { describe, expect, it } from 'vitest';
import { geoArea, geoContains } from 'd3-geo';
import { contourPoints } from './contour.js';

type P = { lon: number; lat: number; v: number };

/** A 1° by 1° patch of observations every 0.1°, valued 8 inside a circle of 30 km round (28, 47) and 4 outside. */
function patch(): P[] {
	const out: P[] = [];
	for (let lon = 27.5; lon <= 28.5001; lon += 0.1) {
		for (let lat = 46.5; lat <= 47.5001; lat += 0.1) {
			const km = Math.hypot((lon - 28) * 111.32 * Math.cos((47 * Math.PI) / 180), (lat - 47) * 111.32);
			out.push({ lon, lat, v: km < 30 ? 8 : 4 });
		}
	}
	return out;
}

const opts = {
	x: (d: P) => d.lon,
	y: (d: P) => d.lat,
	value: (d: P) => d.v,
	bandwidth: 8
};

describe('contourPoints', () => {
	it('draws the area at or above each threshold, wound for d3-geo', () => {
		const [low, high] = contourPoints(patch(), { ...opts, thresholds: [3.5, 6] });
		expect(high.properties.value).toBe(6);
		expect(high.geometry.coordinates.length).toBe(1);
		// Smaller than a hemisphere, so not inside out.
		expect(geoArea(high)).toBeLessThan(0.01);
		expect(geoContains(high, [28, 47])).toBe(true);
		expect(geoContains(high, [28.45, 46.55])).toBe(false);
		// Roughly the 30 km circle: π · 30² ≈ 2,800 km².
		const km2 = geoArea(high) * 6371 ** 2;
		expect(km2).toBeGreaterThan(1800);
		expect(km2).toBeLessThan(4000);
		// Everything observed is at least 4, so the 3.5 area covers the patch but stops near its edge.
		expect(geoContains(low, [27.6, 46.6])).toBe(true);
		expect(geoContains(low, [26.5, 47])).toBe(false);
	});

	it('fades to the background where the data stops, so a lone observation makes no island', () => {
		const lone = [...patch(), { lon: 30, lat: 47, v: 9 }];
		const [high] = contourPoints(lone, {
			...opts,
			thresholds: [6],
			minWeight: 3,
			extent: [
				[27, 46],
				[31, 48]
			]
		});
		expect(geoContains(high, [30, 47])).toBe(false);
		expect(geoContains(high, [28, 47])).toBe(true);
	});

	it('skips missing values and returns empty areas without data', () => {
		const rows = [...patch(), { lon: 28, lat: 47, v: NaN }];
		expect(contourPoints(rows, { ...opts, thresholds: [6] })[0].geometry.coordinates.length).toBe(1);
		const [none] = contourPoints([] as P[], { ...opts, thresholds: [6] });
		expect(none.geometry.coordinates).toEqual([]);
	});
});
