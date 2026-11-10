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

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

function expand(hex: string): string {
	const h = hex.slice(1);
	return h.length === 3 ? `#${[...h].map((c) => c + c).join('')}` : hex;
}

function toLinear(c: number): number {
	return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function toHex(linear: number[]): string {
	return `#${linear
		.map((c) => {
			const s = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
			return Math.round(Math.min(1, Math.max(0, s)) * 255)
				.toString(16)
				.padStart(2, '0');
		})
		.join('')}`;
}

/**
 * A data colour that can be used for text: `color` itself when it reaches
 * `minContrast` (WCAG 4.5:1 by default) against `background`, otherwise the
 * least-changed shade of it that does, darkened towards black on light
 * backgrounds and lightened towards white on dark ones. Lets a label take its
 * series colour and still be readable. Colours that aren't `#rgb`/`#rrggbb`
 * are returned unchanged.
 */
export function readableColor(color: string, background = '#ffffff', minContrast = 4.5): string {
	if (!HEX.test(color) || !HEX.test(background)) return color;
	const c = expand(color).toLowerCase();
	const bg = expand(background);
	if (contrastRatio(c, bg) >= minContrast) return c;
	const target = contrastRatio('#000000', bg) >= contrastRatio('#ffffff', bg) ? 0 : 1;
	const n = parseInt(c.slice(1), 16);
	const linear = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => toLinear(v / 255));
	const mix = (t: number) => toHex(linear.map((v) => v + (target - v) * t));
	// Smallest mix towards black/white that passes; contrast rises with t.
	let [lo, hi] = [0, 1];
	for (let i = 0; i < 24; i++) {
		const mid = (lo + hi) / 2;
		if (contrastRatio(mix(mid), bg) >= minContrast) hi = mid;
		else lo = mid;
	}
	return mix(hi);
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
