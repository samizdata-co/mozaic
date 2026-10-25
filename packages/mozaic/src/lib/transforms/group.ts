import { group as d3group, rollups } from 'd3-array';

/** Group rows by a key: `[{ key, values }]`, in order of first appearance. */
export function groupBy<T, K>(data: T[], key: (d: T) => K): { key: K; values: T[] }[] {
	return Array.from(d3group(data, key), ([k, values]) => ({ key: k, values }));
}

/** Group and reduce: `rollup(rows, d => d.region, v => sum(v, d => d.value))` → `[{ key, value }]`. */
export function rollup<T, K, V>(data: T[], key: (d: T) => K, reduce: (values: T[]) => V): { key: K; value: V }[] {
	return rollups(data, reduce, key).map(([k, value]) => ({ key: k, value }));
}

/** Rebase a series so the value at `baseIndex` equals `base` (default 100). */
export function indexTo<T>(data: T[], value: (d: T) => number, baseIndex = 0, base = 100): (T & { index: number })[] {
	const start = value(data[baseIndex]);
	return data.map((d) => ({ ...d, index: start ? (value(d) / start) * base : NaN }));
}
