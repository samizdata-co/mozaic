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
