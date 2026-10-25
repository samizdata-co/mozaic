/**
 * SVG path for a bar from `base` to `value` along the value axis, `t0`–`t1`
 * across it, with rounded corners only at the data end (square at the baseline).
 */
export function barPath(
	orientation: 'horizontal' | 'vertical',
	base: number,
	value: number,
	t0: number,
	t1: number,
	radius: number
): string {
	const length = Math.abs(value - base);
	const r = Math.max(0, Math.min(radius, (t1 - t0) / 2, length));
	const s = value >= base ? 1 : -1;
	if (orientation === 'horizontal') {
		// Grows along x; data end at x = value.
		return `M${base},${t0}H${value - s * r}Q${value},${t0} ${value},${t0 + r}V${t1 - r}Q${value},${t1} ${value - s * r},${t1}H${base}Z`;
	}
	// Grows along y; data end at y = value.
	return `M${t0},${base}V${value + s * r}Q${t0},${value} ${t0 + r},${value}H${t1 - r}Q${t1},${value} ${t1},${value + s * r}V${base}Z`;
}
