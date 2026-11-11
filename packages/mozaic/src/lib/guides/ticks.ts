import { multiTimeFormat, type Locale } from '../locale/index.js';
import type { PositionScale } from '../core/types.js';

/** Explicit values win; otherwise the scale's own ticks, or the whole domain for band/point scales. */
export function tickValues(scale: PositionScale, count: number, explicit?: unknown[]): unknown[] {
	if (explicit) return explicit;
	return scale.ticks ? scale.ticks(count) : scale.domain();
}

/** Locale-aware default label: dates by multiTimeFormat, numbers with grouping, anything else as text. */
export function defaultTickFormat(values: unknown[], locale: Locale): (value: any) => string {
	if (values[0] instanceof Date) return multiTimeFormat(locale);
	if (typeof values[0] === 'number') return locale.number;
	return (value) => String(value);
}

/**
 * Every how many ticks to label so that no two labels overlap: 1 when all fit, 2 for every other one,
 * and so on. `positions` are the ticks' centres in px (in order), `widths` their labels' widths.
 */
export function tickStride(positions: number[], widths: number[], gap = 8): number {
	for (let stride = 1; stride < positions.length; stride++) {
		let fits = true;
		for (let i = stride; i < positions.length && fits; i += stride) {
			const room = Math.abs(positions[i] - positions[i - stride]);
			fits = room >= (widths[i] + widths[i - stride]) / 2 + gap;
		}
		if (fits) return stride;
	}
	return Math.max(1, positions.length);
}
