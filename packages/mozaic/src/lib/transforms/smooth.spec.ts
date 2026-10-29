import { describe, expect, it } from 'vitest';
import { hemicycleLayout, kernelSmooth, loess } from './index.js';

describe('hemicycleLayout', () => {
	it('places every seat inside the half-ring, left to right', () => {
		const { seats, rows, spacing } = hemicycleLayout(101);
		expect(seats).toHaveLength(101);
		expect(rows).toBeGreaterThan(3);
		for (const s of seats) {
			const r = Math.hypot(s.x, s.y);
			expect(r).toBeGreaterThanOrEqual(0.4);
			expect(r + spacing / 2).toBeLessThanOrEqual(1 + 1e-9);
			expect(s.y).toBeGreaterThanOrEqual(-1e-9);
		}
		const angles = seats.map((s) => s.angle);
		expect(angles).toEqual([...angles].sort((a, b) => b - a));
		expect(seats.map((s) => s.index)).toEqual(seats.map((_, i) => i));
	});

	it('never overlaps seats', () => {
		for (const n of [5, 31, 101, 450]) {
			const { seats, spacing } = hemicycleLayout(n);
			let closest = Infinity;
			for (let i = 0; i < seats.length; i++)
				for (let j = i + 1; j < seats.length; j++)
					closest = Math.min(closest, Math.hypot(seats[i].x - seats[j].x, seats[i].y - seats[j].y));
			expect(closest, `${n} seats`).toBeGreaterThanOrEqual(spacing * 0.999);
		}
	});

	it('honours a fixed number of rows and handles empty chambers', () => {
		expect(hemicycleLayout(60, { rows: 3 }).rows).toBe(3);
		expect(hemicycleLayout(60, { rows: 3 }).seats).toHaveLength(60);
		expect(hemicycleLayout(0).seats).toEqual([]);
		expect(hemicycleLayout(1).seats[0]).toMatchObject({ angle: Math.PI / 2 });
	});
});

describe('kernelSmooth', () => {
	const flat = Array.from({ length: 10 }, (_, i) => ({ t: i, v: 5 }));

	it('returns a constant for constant data', () => {
		const out = kernelSmooth(flat, { x: (d) => d.t, y: (d) => d.v, at: [0, 4.5, 9], bandwidth: 2 });
		for (const d of out) expect(d.y).toBeCloseTo(5);
		expect(out[1].neff).toBeGreaterThan(out[0].neff);
	});

	it('weights points by distance and by weight', () => {
		const data = [
			{ t: 0, v: 0, n: 1 },
			{ t: 10, v: 10, n: 1 }
		];
		const [mid] = kernelSmooth(data, { x: (d) => d.t, y: (d) => d.v, at: [5], bandwidth: 3 });
		expect(mid.y).toBeCloseTo(5);
		const [near] = kernelSmooth(data, { x: (d) => d.t, y: (d) => d.v, at: [2], bandwidth: 3 });
		expect(near.y).toBeLessThan(5);
		const [heavy] = kernelSmooth(data, {
			x: (d) => d.t,
			y: (d) => d.v,
			at: [5],
			bandwidth: 3,
			weight: (d) => (d.t === 10 ? 3 : 1)
		});
		expect(heavy.y).toBeCloseTo(7.5);
	});

	it('gives a standard error that shrinks with more data', () => {
		const one = kernelSmooth([{ t: 0, v: 1 }], {
			x: (d) => d.t,
			y: (d) => d.v,
			at: [0],
			bandwidth: 1,
			variance: () => 4
		});
		expect(one[0].se).toBeCloseTo(2);
		const many = kernelSmooth(
			Array.from({ length: 4 }, () => ({ t: 0, v: 1 })),
			{ x: (d) => d.t, y: (d) => d.v, at: [0], bandwidth: 1, variance: () => 4 }
		);
		expect(many[0].se).toBeCloseTo(1);
	});

	it('works with dates, skips missing values and points out of reach', () => {
		const day = 864e5;
		const data = [
			{ date: new Date(2026, 0, 1), v: 10 },
			{ date: new Date(2026, 0, 2), v: null },
			{ date: new Date(2026, 0, 3), v: 20 }
		];
		const at = [new Date(2026, 0, 2), new Date(2027, 0, 1)];
		const out = kernelSmooth(data, { x: (d) => d.date, y: (d) => d.v, at, bandwidth: 2 * day, kernel: 'epanechnikov' });
		expect(out).toHaveLength(1);
		expect(out[0].x).toBeInstanceOf(Date);
		expect(out[0].y).toBeCloseTo(15);
	});
});

describe('loess', () => {
	it('reproduces a straight line', () => {
		const data = Array.from({ length: 20 }, (_, i) => ({ x: i, y: 2 * i + 1 }));
		for (const d of loess(data, { x: (d) => d.x, y: (d) => d.y, span: 0.4 })) expect(d.y).toBeCloseTo(2 * d.x + 1);
	});

	it('evaluates at given points and resists an outlier with robustness iterations', () => {
		const data = Array.from({ length: 21 }, (_, i) => ({ x: i, y: i === 10 ? 100 : 5 }));
		const [plain] = loess(data, { x: (d) => d.x, y: (d) => d.y, at: [10], span: 0.5 });
		const [robust] = loess(data, { x: (d) => d.x, y: (d) => d.y, at: [10], span: 0.5, iterations: 2 });
		expect(plain.y).toBeGreaterThan(10);
		expect(robust.y).toBeCloseTo(5);
	});
});
