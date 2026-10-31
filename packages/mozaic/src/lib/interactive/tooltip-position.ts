/**
 * Left edge of a tooltip, in plot-area pixels, for a point at `x`: beside the point, on the
 * right unless the point is in the right part of the plot (or there is no room there), and
 * always inside the chart (the plot area plus its padding).
 */
export function tooltipLeft(
	x: number,
	tooltipWidth: number,
	plot: { width: number; padding: { left: number; right: number } },
	offset = 12
): number {
	const min = 0 - plot.padding.left;
	const max = plot.width + plot.padding.right - tooltipWidth;
	const right = x + offset;
	const left = x - offset - tooltipWidth;
	const preferLeft = x > plot.width * 0.6;
	const fitsRight = right <= max;
	const fitsLeft = left >= min;
	const chosen = preferLeft ? (fitsLeft || !fitsRight ? left : right) : fitsRight || !fitsLeft ? right : left;
	return Math.max(min, Math.min(max, chosen));
}
