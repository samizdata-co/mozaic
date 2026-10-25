/** CSS pixels per millimetre (96 dpi). */
export const PX_PER_MM = 96 / 25.4;

/** Millimetres → CSS pixels, for print widths: `<Chart medium="print" width={mm(55)}>`. */
export function mm(value: number): number {
	return value * PX_PER_MM;
}

/** Points → CSS pixels. */
export function pt(value: number): number {
	return (value * 96) / 72;
}
