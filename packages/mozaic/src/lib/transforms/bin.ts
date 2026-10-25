import { bin as d3bin, extent } from 'd3-array';

export interface Bin<T> {
	x0: number;
	x1: number;
	count: number;
	values: T[];
}

/**
 * Histogram bins. `thresholds` is a target bin count, or explicit bin edges
 * including both ends (`[0, 5, 10]` → bins 0–5 and 5–10; the last bin includes its upper edge).
 * Returns `{ x0, x1, count, values }` per bin.
 */
export function bin<T>(
	data: T[],
	value: (d: T) => number,
	options: { thresholds?: number | number[]; domain?: [number, number] } = {}
): Bin<T>[] {
	const generator = d3bin<T, number>().value(value);
	const edges = Array.isArray(options.thresholds) ? options.thresholds : undefined;
	const domain =
		options.domain ?? (edges ? [edges[0], edges[edges.length - 1]] : (extent(data, value) as [number, number]));
	if (domain[0] !== undefined) generator.domain(domain as [number, number]);
	if (edges) generator.thresholds(edges.slice(1, -1));
	else if (typeof options.thresholds === 'number') generator.thresholds(options.thresholds);
	return generator(data).map((b) => ({ x0: b.x0 ?? 0, x1: b.x1 ?? 0, count: b.length, values: [...b] }));
}
