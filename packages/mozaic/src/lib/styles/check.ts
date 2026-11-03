import { base } from './base.js';
import { contrastRatio } from './color.js';
import type { Theme } from './types.js';

/**
 * Problems with a house style, as sentences (empty when there are none): every
 * base token defined, at least five categorical and sequential colours as
 * `#rrggbb`, and text colours readable on the background (text 7:1, muted 4.5:1).
 * Run it in a brand's or project's tests: `expect(checkTheme(theme)).toEqual([])`.
 */
export function checkTheme(theme: Theme): string[] {
	const issues: string[] = [];
	const missing = Object.keys(base.tokens).filter((key) => !(key in theme.tokens));
	if (missing.length) issues.push(`Missing tokens: ${missing.join(', ')}.`);
	for (const name of ['categorical', 'sequential'] as const) {
		const colors = theme.palettes[name];
		if (colors.length < 5) issues.push(`The ${name} palette has ${colors.length} colours; it needs at least 5.`);
		const invalid = colors.filter((c) => !/^#[0-9a-f]{6}$/i.test(c));
		if (invalid.length) issues.push(`The ${name} palette has colours that are not #rrggbb: ${invalid.join(', ')}.`);
	}
	const bg = theme.tokens['--mz-color-bg'];
	for (const [token, minimum] of [
		['--mz-color-text', 7],
		['--mz-color-muted', 4.5]
	] as const) {
		const ratio = contrastRatio(theme.tokens[token], bg);
		if (!(ratio >= minimum))
			issues.push(`${token} has ${ratio.toFixed(2)}:1 contrast on the background; it needs ${minimum}:1.`);
	}
	return issues;
}
