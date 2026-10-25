/**
 * Beeswarm layout: given pixel positions along one axis, returns offsets on
 * the other axis so circles of `radius` do not overlap. Offsets alternate
 * either side of 0 (or only positive with `side: 'positive'`).
 * Returns offsets in the original order.
 */
export function dodge(
	positions: number[],
	radius: number,
	options: { padding?: number; side?: 'both' | 'positive' } = {}
): number[] {
	const { padding = 1, side = 'both' } = options;
	const diameter = radius * 2 + padding;
	const d2 = diameter * diameter;
	const order = positions.map((p, i) => ({ p, i })).sort((a, b) => a.p - b.p);
	const placed: { p: number; y: number }[] = [];
	const result = new Array<number>(positions.length);

	for (const { p, i } of order) {
		// Neighbours close enough on the main axis to collide.
		const near = placed.filter((q) => Math.abs(q.p - p) < diameter);
		let y = 0;
		if (near.some((q) => (q.p - p) ** 2 + (q.y - y) ** 2 < d2)) {
			// Candidate offsets: just touching each neighbour, smallest |y| first.
			const candidates: number[] = [];
			for (const q of near) {
				const dy = Math.sqrt(Math.max(0, d2 - (q.p - p) ** 2));
				candidates.push(q.y + dy);
				if (side === 'both') candidates.push(q.y - dy);
			}
			candidates.sort((a, b) => Math.abs(a) - Math.abs(b));
			y =
				candidates.find(
					(c) => (side === 'both' || c >= 0) && near.every((q) => (q.p - p) ** 2 + (q.y - c) ** 2 >= d2 - 1e-6)
				) ?? 0;
		}
		placed.push({ p, y });
		result[i] = y;
	}
	return result;
}
