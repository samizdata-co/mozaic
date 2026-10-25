/**
 * Nudge 1-D label positions apart so neighbours are at least `gap` px apart,
 * keeping them inside [min, max] where possible. Returns positions in the
 * original order. Used for direct line labels.
 */
export function avoidOverlap(
	positions: number[],
	gap: number,
	[min, max]: [number, number] = [-Infinity, Infinity]
): number[] {
	const order = positions.map((p, i) => ({ p, i })).sort((a, b) => a.p - b.p);
	const placed = order.map((o) => Math.min(max, Math.max(min, o.p)));

	// Push down from the top, then back up from the bottom if we ran past `max`.
	for (let k = 1; k < placed.length; k++) placed[k] = Math.max(placed[k], placed[k - 1] + gap);
	if (placed.length && placed[placed.length - 1] > max) {
		placed[placed.length - 1] = max;
		for (let k = placed.length - 2; k >= 0; k--) placed[k] = Math.min(placed[k], placed[k + 1] - gap);
	}

	const result = new Array<number>(positions.length);
	order.forEach((o, k) => (result[o.i] = placed[k]));
	return result;
}
