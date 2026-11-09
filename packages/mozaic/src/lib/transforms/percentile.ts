/** One published point of a distribution: the value below which `p`% of the group falls. */
export interface PercentilePoint {
	/** Percentile, 0–100 (50 is the median). */
	p: number;
	value: number;
}

/** Where a value sits in a distribution, from {@link percentileRank}. */
export interface PercentileRank {
	/** Estimated percentile, 0–100. Outside the published range, the nearest published percentile. */
	percentile: number;
	/** The value is below the lowest published point, so the true percentile is lower than `percentile`. */
	below: boolean;
	/** The value is above the highest published point, so the true percentile is higher than `percentile`. */
	above: boolean;
}

/**
 * Estimate the percentile of `value` in a distribution known only at some
 * percentiles (as statistics offices publish pay: 10th, 25th, median, …), by
 * linear interpolation between the neighbouring points. Points with a missing
 * or non-finite value are skipped. Returns `undefined` when no point is left.
 *
 * ```ts
 * percentileRank(38000, [{ p: 25, value: 29951 }, { p: 50, value: 34432 }, { p: 75, value: 40009 }]);
 * // { percentile: 67.8…, below: false, above: false }
 * ```
 */
export function percentileRank(
	value: number,
	points: { p: number; value: number | null | undefined }[]
): PercentileRank | undefined {
	const known = points
		.filter((d): d is PercentilePoint => d.value !== null && d.value !== undefined && Number.isFinite(d.value))
		.toSorted((a, b) => a.p - b.p);
	if (!known.length || !Number.isFinite(value)) return undefined;
	const first = known[0];
	const last = known[known.length - 1];
	if (value < first.value) return { percentile: first.p, below: true, above: false };
	if (value > last.value) return { percentile: last.p, below: false, above: true };
	// The last point at or below the value; the next one is above it (or there is none).
	let i = 0;
	while (i + 1 < known.length && known[i + 1].value <= value) i++;
	const a = known[i];
	const b = known[i + 1];
	if (!b) return { percentile: a.p, below: false, above: false };
	const t = (value - a.value) / (b.value - a.value);
	return { percentile: a.p + t * (b.p - a.p), below: false, above: false };
}
