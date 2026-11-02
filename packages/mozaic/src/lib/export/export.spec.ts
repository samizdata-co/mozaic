import { describe, expect, it } from 'vitest';
import { fileName } from './download.js';
import { coversText, familyNames, pickFontFaces } from './fonts.js';

describe('fileName', () => {
	it('turns a title into a file name', () => {
		expect(fileName('86% dintre britanici au auzit de Moldova; 26% spun că le place')).toBe(
			'86-dintre-britanici-au-auzit-de-moldova-26-spun-ca-le-place'
		);
		expect(fileName('Șase partide în Parlament')).toBe('sase-partide-in-parlament');
		expect(fileName('Опрос: ПАС лидирует')).toBe('опрос-пас-лидирует');
	});

	it('falls back when the title is empty, and keeps names short', () => {
		expect(fileName('  — ')).toBe('chart');
		expect(fileName('a '.repeat(100)).length).toBeLessThanOrEqual(80);
		expect(fileName('a '.repeat(100))).not.toMatch(/-$/);
	});
});

describe('fonts for PNG export', () => {
	const css = `
@font-face { font-family: 'IBM Plex Sans'; font-weight: 400; src: url(./plex-400-latin.woff2) format('woff2'); unicode-range: U+0000-00FF, U+0131; }
@font-face { font-family: 'IBM Plex Sans'; font-weight: 400; src: url(./plex-400-cyrillic.woff2) format('woff2'); unicode-range: U+0400-045F; }
@font-face { font-family: 'IBM Plex Sans'; font-weight: 700; src: url(./plex-700-latin.woff2) format('woff2'); unicode-range: U+0000-00FF; }
@font-face { font-family: 'Other'; src: url(/other.woff2); }
@font-face { font-family: 'Variable'; font-weight: 100 900; src: url("https://cdn.test/var.woff2"); }`;

	it('reads family lists without generic names', () => {
		expect(familyNames('"IBM Plex Sans", system-ui, sans-serif')).toEqual(['IBM Plex Sans']);
	});

	it('matches unicode ranges, with wildcards', () => {
		expect(coversText('U+0000-00FF, U+0131', 'Moldova')).toBe(true);
		expect(coversText('U+0400-045F', 'Moldova')).toBe(false);
		expect(coversText('U+04??', 'Молдова')).toBe(true);
	});

	it('keeps only the faces the chart uses, with absolute URLs', () => {
		const used = { families: new Set(['IBM Plex Sans', 'Variable']), weights: new Set([400, 600]), text: 'Moldova' };
		const picked = pickFontFaces(css, 'https://fonts.test/css/', used);
		expect(picked).toHaveLength(2);
		expect(picked[0]).toContain('url("https://fonts.test/css/plex-400-latin.woff2")');
		expect(picked[1]).toContain('url("https://cdn.test/var.woff2")');
	});
});
