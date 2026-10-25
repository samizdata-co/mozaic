import {
	stack as d3stack,
	stackOffsetDiverging,
	stackOffsetExpand,
	stackOffsetNone,
	stackOrderNone,
	stackOrderAscending,
	stackOrderDescending,
	stackOrderInsideOut
} from 'd3-shape';

export interface StackedRow<T> {
	/** The category along the stacking axis (e.g. a year). */
	key: string | number | Date;
	/** The series this segment belongs to. */
	series: string;
	value: number;
	/** Where the segment starts and ends on the value axis. */
	start: number;
	end: number;
	datum: T;
}

export interface StackOptions<T> {
	key: (d: T) => string | number | Date;
	series: (d: T) => string;
	value: (d: T) => number;
	/** Series order, bottom to top. Defaults to first appearance. */
	seriesOrder?: string[] | 'ascending' | 'descending' | 'insideOut';
	/** `none` stacks values; `expand` normalises each key to 0–1; `diverging` stacks negatives below zero. */
	offset?: 'none' | 'expand' | 'diverging';
}

/**
 * Stack long-format rows (one row per key × series). Returns one row per
 * segment with `start`/`end`, ready for `<Bars base={d => d.start} …>` or `<Area>`.
 */
export function stack<T>(data: T[], options: StackOptions<T>): StackedRow<T>[] {
	const { key, series, value, seriesOrder, offset = 'none' } = options;
	const keys: (string | number | Date)[] = [];
	const keyIndex = new Map<string, number>();
	const seriesNames: string[] = Array.isArray(seriesOrder) ? [...seriesOrder] : [];
	const cells = new Map<string, T>();

	for (const d of data) {
		const k = key(d);
		const ks = String(k instanceof Date ? k.getTime() : k);
		if (!keyIndex.has(ks)) {
			keyIndex.set(ks, keys.length);
			keys.push(k);
		}
		const s = series(d);
		if (!seriesNames.includes(s)) seriesNames.push(s);
		cells.set(`${ks}\u0000${s}`, d);
	}

	const keyString = (k: string | number | Date) => String(k instanceof Date ? k.getTime() : k);
	const order =
		seriesOrder === 'ascending'
			? stackOrderAscending
			: seriesOrder === 'descending'
				? stackOrderDescending
				: seriesOrder === 'insideOut'
					? stackOrderInsideOut
					: stackOrderNone;
	const stackOffset =
		offset === 'expand' ? stackOffsetExpand : offset === 'diverging' ? stackOffsetDiverging : stackOffsetNone;

	const layers = d3stack<string | number | Date, string>()
		.keys(seriesNames)
		.value((k, s) => {
			const d = cells.get(`${keyString(k)}\u0000${s}`);
			return d ? value(d) : 0;
		})
		.order(order)
		.offset(stackOffset)(keys);

	const rows: StackedRow<T>[] = [];
	for (const layer of layers) {
		for (const point of layer) {
			const k = point.data;
			const d = cells.get(`${keyString(k)}\u0000${layer.key}`);
			if (!d) continue;
			// `start` is always the baseline side, so negative segments run from start down to end.
			const negative = value(d) < 0;
			rows.push({
				key: k,
				series: layer.key,
				value: value(d),
				start: negative ? point[1] : point[0],
				end: negative ? point[0] : point[1],
				datum: d
			});
		}
	}
	return rows;
}
