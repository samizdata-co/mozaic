import type { Breakpoint, Theme } from './types.js';

export type { Breakpoint, Medium, Padding, Theme, ThemeOverrides } from './types.js';
/** House styles live with each brand (e.g. `datavis/mozaic/` in a brand repo) and extend `base`. */
export { base, extendTheme } from './base.js';
export { contrastRatio, luminance, rampSteps } from './color.js';
export { checkTheme } from './check.js';

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
