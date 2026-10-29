/** One seat in a hemicycle, in unit coordinates: outer radius 1, centre (0, 0), y up. */
export interface Seat {
	/** Position in seat order: 0 is the far left, the last seat is the far right. */
	index: number;
	/** Row, 0 = innermost. */
	row: number;
	/** Angle in radians, π (left) to 0 (right). */
	angle: number;
	x: number;
	y: number;
}

export interface HemicycleOptions {
	/** Number of rows. Defaults to the fewest rows that fit the seats. */
	rows?: number;
	/** Inner radius as a fraction of the outer radius (0–1). */
	innerRadius?: number;
}

export interface HemicycleLayout {
	seats: Seat[];
	rows: number;
	/** Distance between rows, in unit coordinates: the largest seat diameter that never overlaps. */
	spacing: number;
}

/**
 * Seat positions for a parliament chart. Rows are spread evenly between the
 * inner and outer radius, each row gets seats in proportion to its length,
 * and seats are numbered by angle from left to right, so filling parties in
 * order gives each party a wedge.
 */
export function hemicycleLayout(total: number, { rows, innerRadius = 0.4 }: HemicycleOptions = {}): HemicycleLayout {
	const n = Math.max(0, Math.floor(total));
	if (n === 0) return { seats: [], rows: 0, spacing: 0 };
	const r0 = Math.min(0.9, Math.max(0, innerRadius));

	const geometry = (count: number) => {
		const spacing = (1 - r0) / count;
		const radii = Array.from({ length: count }, (_, i) => r0 + spacing * (i + 0.5));
		const capacity = radii.map((r) => Math.floor((Math.PI * r) / spacing) + 1);
		return { spacing, radii, capacity };
	};

	let count = rows && rows > 0 ? Math.floor(rows) : 1;
	if (!rows) while (geometry(count).capacity.reduce((a, b) => a + b, 0) < n) count++;
	const { spacing, radii, capacity } = geometry(count);

	// Seats per row in proportion to row length (largest remainder), never above capacity
	// unless the caller forced too few rows.
	const length = radii.reduce((a, b) => a + b, 0);
	const exact = radii.map((r) => (n * r) / length);
	const perRow = exact.map(Math.floor);
	const order = exact.map((e, i) => ({ i, rest: e - Math.floor(e) })).sort((a, b) => b.rest - a.rest || b.i - a.i);
	for (let k = 0, left = n - perRow.reduce((a, b) => a + b, 0); left > 0; k++, left--) perRow[order[k % count].i]++;
	if (!rows) {
		// Move overflow from full rows outwards (rare, with very few seats).
		for (let i = 0; i < count - 1; i++) {
			const extra = perRow[i] - capacity[i];
			if (extra > 0) {
				perRow[i] -= extra;
				perRow[i + 1] += extra;
			}
		}
	}

	const seats: Omit<Seat, 'index'>[] = [];
	radii.forEach((r, row) => {
		const m = perRow[row];
		for (let j = 0; j < m; j++) {
			const angle = m === 1 ? Math.PI / 2 : Math.PI * (1 - j / (m - 1));
			seats.push({ row, angle, x: r * Math.cos(angle), y: r * Math.sin(angle) });
		}
	});
	seats.sort((a, b) => b.angle - a.angle || a.row - b.row);
	return { seats: seats.map((s, index) => ({ index, ...s })), rows: count, spacing };
}
