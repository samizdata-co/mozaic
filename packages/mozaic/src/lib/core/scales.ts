import type { PlotContext, PositionScale } from './types.js';

export function isScale(value: unknown): value is PositionScale {
	return typeof value === 'function' && typeof (value as { domain?: unknown }).domain === 'function';
}

/** True for band and point scales (they have a bandwidth). */
export function isOrdinal(scale: unknown): boolean {
	return isScale(scale) && typeof scale.bandwidth === 'function';
}

/**
 * Pixel position of a value. For band scales, returns the point at `align`
 * across the band (0.5 = centre), so marks can treat all scales alike.
 */
export function scaled(scale: PositionScale, value: unknown, align = 0.5): number {
	const px = scale(value);
	if (px == null || Number.isNaN(px)) return NaN;
	return scale.bandwidth ? px + scale.bandwidth() * align : px;
}

/** Rough text width for layout decisions (padding for long labels). Deterministic on server and client. */
export function estimateTextWidth(text: string, fontSize: number, averageCharWidth = 0.56): number {
	return text.length * fontSize * averageCharWidth;
}

/**
 * Pixel position of a data point. With a projection on the plot, `x`/`y` are
 * longitude/latitude; otherwise they go through the x and y scales.
 */
export function position(plot: PlotContext, x: unknown, y: unknown): [number, number] {
	if (plot.projection) {
		const p = plot.projection([Number(x), Number(y)]);
		return p ? [p[0], p[1]] : [NaN, NaN];
	}
	return [scaled(plot.x, x), scaled(plot.y, y)];
}
