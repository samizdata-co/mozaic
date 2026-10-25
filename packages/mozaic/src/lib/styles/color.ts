/** Relative luminance (WCAG 2) of a `#rrggbb` colour. */
export function luminance(hex: string): number {
	const n = parseInt(hex.replace('#', ''), 16);
	const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
		const s = c / 255;
		return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two `#rrggbb` colours (1–21). */
export function contrastRatio(a: string, b: string): number {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
}

/**
 * `n` colours from a light → dark ramp for binned data (choropleths, heat
 * steps). Steps too pale to see against `background` (below `minContrast`)
 * are skipped when the ramp has enough others; the rest are picked evenly,
 * so the brand's exact colours are used and the darkest step is always kept.
 */
export function rampSteps(ramp: string[], n: number, background = '#ffffff', minContrast = 2): string[] {
	const visible = ramp.filter((c) => contrastRatio(c, background) >= minContrast);
	const source = visible.length >= n ? visible : ramp;
	if (n <= 1) return [source[source.length - 1]];
	if (n >= source.length) return [...source];
	return Array.from({ length: n }, (_, i) => source[Math.round((i * (source.length - 1)) / (n - 1))]);
}
