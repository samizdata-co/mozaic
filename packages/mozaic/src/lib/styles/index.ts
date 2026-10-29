import { base, extendTheme } from './base.js';
import { samizdata } from './samizdata.js';
import { zdg } from './zdg.js';
import { moldovaAlege } from './moldova-alege.js';
import type { Breakpoint, Theme } from './types.js';

export type { Breakpoint, Medium, Padding, Theme, ThemeOverrides } from './types.js';
export { base, extendTheme, moldovaAlege, samizdata, zdg };
export { contrastRatio, luminance, rampSteps } from './color.js';

/** Registry of built-in house styles. Add a style by adding a file and an entry here. */
export const styles = { base, samizdata, zdg, 'moldova-alege': moldovaAlege } satisfies Record<string, Theme>;
export type StyleName = keyof typeof styles;

export function resolveStyle(style: StyleName | Theme): Theme {
	if (typeof style !== 'string') return style;
	const theme = styles[style];
	if (!theme) throw new Error(`Unknown mozaic style "${style}". Known styles: ${Object.keys(styles).join(', ')}`);
	return theme;
}

/** Serialise theme tokens into an inline `style` attribute value. */
export function tokensToStyle(tokens: Theme['tokens']): string {
	return Object.entries(tokens)
		.map(([key, value]) => `${key}: ${value}`)
		.join('; ');
}

export function breakpointFor(width: number, breakpoints: Theme['breakpoints']): Breakpoint {
	if (width >= breakpoints.l) return 'l';
	if (width >= breakpoints.m) return 'm';
	return 's';
}
