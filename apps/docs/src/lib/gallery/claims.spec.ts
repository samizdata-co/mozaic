import { describe, expect, it } from 'vitest';
import { max, median, mean } from 'd3-array';
import { rows as budget } from './budget-bars/data';
import { series as regional } from './regional-lines/data';
import { rows as energy } from './stacked-columns/data';
import { rows as employment } from './grouped-bars/data';
import { districts } from './scatter/data';
import { points as unemployment } from './area-band/data';
import { rows as turnout } from './slope/data';
import { rows as wages } from './dumbbell/data';
import { rows as budgets } from './beeswarm/data';
import { incomes } from './histogram/data';
import { rows as spending } from './treemap/data';
import { series as cities } from './small-multiples/data';
import { cells } from './heatmap/data';
import { majority, parties } from './parliament/data';
import { series as pollSeries } from './poll-tracker/data';

// The gallery data is synthetic, but each headline must still be true of it.
describe('gallery headlines match their data', () => {
	it('budget-bars: defence grew the most', () => {
		expect(budget.toSorted((a, b) => b.change - a.change)[0].id).toBe('defence');
	});

	it('regional-lines: the capital ends highest', () => {
		const last = (id: string) => regional.find((s) => s.id === id)!.values.at(-1)!.value;
		expect(Math.max(...['north', 'centre', 'south'].map(last))).toBeLessThan(last('capital'));
	});

	it('stacked-columns: wind and solar grew', () => {
		for (const source of ['wind', 'solar']) {
			const values = energy.filter((d) => d.source === source).map((d) => d.twh);
			expect(values.at(-1)!).toBeGreaterThan(values[0] * 3);
		}
	});

	it('grouped-bars: the gap is widest at 25–34', () => {
		const gaps = [...new Set(employment.map((d) => d.age))].map((age) => {
			const [w, m] = ['women', 'men'].map((g) => employment.find((d) => d.age === age && d.group === g)!.rate);
			return { age, gap: m - w };
		});
		expect(gaps.toSorted((a, b) => b.gap - a.gap)[0].age).toBe('25–34');
	});

	it('scatter: income falls with distance', () => {
		const near = mean(
			districts.filter((d) => d.distance < 80),
			(d) => d.income
		)!;
		const far = mean(
			districts.filter((d) => d.distance > 150),
			(d) => d.income
		)!;
		expect(near).toBeGreaterThan(far);
	});

	it('area-band: unemployment jumped in 2020 and ended below its starting level', () => {
		const before = unemployment.find((p) => p.date.getFullYear() === 2020 && p.date.getMonth() === 1)!.rate;
		const peak = max(
			unemployment.filter((p) => p.date.getFullYear() === 2020),
			(p) => p.rate
		)!;
		expect(peak).toBeGreaterThan(before + 0.02);
		expect(unemployment.at(-1)!.rate).toBeLessThan(unemployment[0].rate);
	});

	it('slope: turnout rose everywhere except the south', () => {
		for (const r of turnout) expect(r.after > r.before, r.region).toBe(r.region !== 'south');
	});

	it('dumbbell: men earn more in every sector', () => {
		for (const r of wages) expect(r.men).toBeGreaterThan(r.women);
	});

	it('beeswarm: only the two big cities spend more than 5,000 per resident', () => {
		expect(
			budgets
				.filter((d) => d.perResident > 5000)
				.map((d) => d.name)
				.sort()
		).toEqual(['Bălți', 'Chișinău']);
		expect(Math.max(...budgets.filter((d) => d.perResident <= 5000).map((d) => d.perResident))).toBeLessThan(4600);
	});

	it('histogram: the median is below the mean', () => {
		expect(median(incomes)!).toBeLessThan(mean(incomes)!);
	});

	it('treemap: social spending is more than half', () => {
		const total = spending.reduce((s, d) => s + d.value, 0);
		const social = spending.filter((d) => d.group === 'social').reduce((s, d) => s + d.value, 0);
		expect(social / total).toBeGreaterThan(0.5);
	});

	it('small-multiples: only Soroca fell', () => {
		for (const s of cities) expect(s.values.at(-1)!.value < s.values[0].value, s.id).toBe(s.id === 'soroca');
	});

	it('heatmap: recent years are mostly warmer than average', () => {
		const recent = cells.filter((c) => Number(c.year) >= 2022);
		expect(recent.filter((c) => c.anomaly > 0).length / recent.length).toBeGreaterThan(0.6);
	});

	it('parliament: no party can govern alone', () => {
		expect(Math.max(...parties.map((p) => p.seats))).toBeLessThan(majority);
		expect(parties.reduce((s, p) => s + p.seats, 0)).toBe(101);
	});

	it('poll-tracker: the two largest parties are now level', () => {
		const at = (id: string, i: number) => pollSeries.find((s) => s.id === id)!.values.at(i)!.value;
		expect(at('a', 0) - at('b', 0)).toBeGreaterThan(6);
		expect(Math.abs(at('a', -1) - at('b', -1))).toBeLessThan(2);
		expect(at('d', -1)).toBeLessThan(5);
	});
});
