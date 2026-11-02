/**
 * Web fonts for exported images. A PNG is drawn from the SVG as an image, and an SVG image cannot load
 * the page's fonts, so the `@font-face` rules the chart uses are copied into it with their files inlined.
 */

export interface UsedFonts {
	/** Font family names, without quotes. */
	families: Set<string>;
	/** Numeric weights ("400", "600"). */
	weights: Set<number>;
	/** Every character of the chart's text. */
	text: string;
}

const GENERIC = new Set(['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'ui-monospace']);

/** Family names from a CSS `font-family` list. */
export function familyNames(list: string): string[] {
	return list
		.split(',')
		.map((f) => f.trim().replace(/^["']|["']$/g, ''))
		.filter((f) => f && !GENERIC.has(f));
}

/** Whether a `unicode-range` (U+0000-00FF, U+0131, U+04??) covers any of the characters. */
export function coversText(range: string, text: string): boolean {
	const spans = range.split(',').map((part) => {
		const m = part.trim().replace(/^U\+/i, '');
		const [lo, hi = lo] = m.includes('-') ? m.split('-') : [m.replace(/\?/g, '0'), m.replace(/\?/g, 'F')];
		return [parseInt(lo, 16), parseInt(hi, 16)];
	});
	for (const ch of text) {
		const code = ch.codePointAt(0)!;
		if (spans.some(([lo, hi]) => code >= lo && code <= hi)) return true;
	}
	return false;
}

/** The `@font-face` rules in `css` that the chart uses, with their `url(…)`s made absolute against `base`. */
export function pickFontFaces(css: string, base: string, used: UsedFonts): string[] {
	const families = new Set([...used.families].map((f) => f.toLowerCase()));
	const picked: string[] = [];
	for (const [rule] of css.matchAll(/@font-face\s*\{[^}]*\}/g)) {
		const family = rule.match(/font-family\s*:\s*([^;}]+)/i)?.[1];
		if (!family || !familyNames(family).some((f) => families.has(f.toLowerCase()))) continue;
		const weight = rule.match(/font-weight\s*:\s*([^;}]+)/i)?.[1].trim();
		if (weight) {
			const [lo, hi = lo] = weight.split(/\s+/).map((w) => (w === 'normal' ? 400 : w === 'bold' ? 700 : Number(w)));
			if (![...used.weights].some((w) => w >= lo && w <= hi)) continue;
		}
		const range = rule.match(/unicode-range\s*:\s*([^;}]+)/i)?.[1];
		if (range && !coversText(range, used.text)) continue;
		picked.push(rule.replace(/url\(\s*(["']?)([^)"']+)\1\s*\)/g, (_, __, url) => `url("${new URL(url, base).href}")`));
	}
	return picked;
}

/** Families, weights and characters of the text in a rendered chart. */
export function usedFonts(figure: HTMLElement, skip: (el: Element) => boolean): UsedFonts {
	const used: UsedFonts = { families: new Set(), weights: new Set(), text: '' };
	const walker = document.createTreeWalker(figure, NodeFilter.SHOW_TEXT);
	for (let node = walker.nextNode(); node; node = walker.nextNode()) {
		const el = node.parentElement;
		if (!el || !node.textContent?.trim() || skip(el)) continue;
		const cs = getComputedStyle(el);
		for (const f of familyNames(cs.fontFamily)) used.families.add(f);
		used.weights.add(Number(cs.fontWeight) || 400);
		used.text += node.textContent;
	}
	return used;
}

async function dataUrl(url: string): Promise<string> {
	const blob = await (await fetch(url)).blob();
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(blob);
	});
}

/**
 * A `<style>` with the page's `@font-face` rules that the chart uses, font files inlined, for an SVG drawn as
 * an image. Stylesheets the page cannot read (another origin) are fetched; fonts that cannot be fetched are
 * left out, and the image falls back to the system's fonts for them.
 */
export async function embeddedFontStyle(used: UsedFonts): Promise<string> {
	// A set: each chart on a page adds the same stylesheet, and pages may load a font twice.
	const rules = new Set<string>();
	const read = new Set<string>();
	for (const sheet of document.styleSheets) {
		if (sheet.href && read.has(sheet.href)) continue;
		if (sheet.href) read.add(sheet.href);
		const base = sheet.href ?? document.baseURI;
		let css = '';
		try {
			css = [...sheet.cssRules].map((r) => r.cssText).join('\n');
		} catch {
			if (sheet.href)
				css = await fetch(sheet.href).then(
					(r) => (r.ok ? r.text() : ''),
					() => ''
				);
		}
		for (const rule of pickFontFaces(css, base, used)) rules.add(rule);
	}
	const inlined = await Promise.all(
		[...rules].map(async (rule) => {
			const urls = [...rule.matchAll(/url\("([^"]+)"\)/g)].map((m) => m[1]);
			let out = rule;
			for (const url of urls) {
				const data = await dataUrl(url).catch(() => null);
				if (!data) return '';
				out = out.replace(url, data);
			}
			return out;
		})
	);
	const css = inlined.filter(Boolean).join('\n');
	return css ? `<style>${css}</style>` : '';
}
