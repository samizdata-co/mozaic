export interface CalloutGeometry {
	/** Curved connector from the label to the target. */
	arrow: string;
	/** Arrowhead at the target end. */
	head: string;
}

/**
 * Connector from a label at (lx, ly) to a target at (tx, ty). The label block
 * spans `top`–`bottom` vertically; `anchor` is the label's text-anchor.
 * `bend` > 0 curves clockwise, < 0 anticlockwise, 0 is straight.
 */
export function calloutGeometry({
	tx,
	ty,
	lx,
	ly,
	top,
	bottom,
	anchor,
	bend,
	gap = 4,
	headSize = 6
}: {
	tx: number;
	ty: number;
	lx: number;
	ly: number;
	top: number;
	bottom: number;
	anchor: 'start' | 'middle' | 'end';
	bend: number;
	gap?: number;
	headSize?: number;
}): CalloutGeometry {
	const dx = lx - tx;
	const dy = ly - ty;

	// Start from the side of the label that faces the target.
	let sx: number;
	let sy: number;
	if (Math.abs(dy) >= Math.abs(dx) || anchor === 'middle') {
		sx = lx;
		sy = dy < 0 ? bottom + gap : top - gap;
	} else {
		sx = anchor === 'start' ? lx - gap : lx + gap;
		sy = (top + bottom) / 2;
	}

	// Stop just short of the target.
	const len = Math.hypot(tx - sx, ty - sy) || 1;
	const ex = tx - ((tx - sx) / len) * gap;
	const ey = ty - ((ty - sy) / len) * gap;

	// Control point: the midpoint pushed sideways by `bend`.
	const mx = (sx + ex) / 2;
	const my = (sy + ey) / 2;
	const cx = mx + (ey - sy) * bend;
	const cy = my - (ex - sx) * bend;

	// Arrowhead along the curve's tangent at the end (control point → end).
	const tl = Math.hypot(ex - cx, ey - cy) || 1;
	const ux = (ex - cx) / tl;
	const uy = (ey - cy) / tl;
	const spread = (28 * Math.PI) / 180;
	const wing = (angle: number) => {
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);
		return [ex - headSize * (ux * cos - uy * sin), ey - headSize * (ux * sin + uy * cos)];
	};
	const [ax, ay] = wing(spread);
	const [bx, by] = wing(-spread);

	return {
		arrow: `M${sx},${sy}Q${cx},${cy} ${ex},${ey}`,
		head: `M${ax},${ay}L${ex},${ey}L${bx},${by}`
	};
}
