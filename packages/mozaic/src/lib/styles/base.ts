import type { Theme, ThemeOverrides } from './types.js';

/** Neutral defaults every house style extends. */
export const base: Theme = {
	name: 'base',
	label: 'Base',
	tokens: {
		'--mz-font-title': "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
		'--mz-font-body': "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
		'--mz-weight-title': '700',
		'--mz-tracking-title': 'normal',
		'--mz-font-label': "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
		'--mz-weight-label': '600',
		'--mz-weight-strong': '600',
		'--mz-label-transform': 'none',
		'--mz-label-tracking': 'normal',
		'--mz-control-transform': 'none',
		'--mz-control-tracking': 'normal',
		'--mz-size-title': '1.375rem',
		'--mz-size-subtitle': '1rem',
		'--mz-size-body': '0.9375rem',
		'--mz-size-small': '0.8125rem',
		'--mz-size-axis': '12px',
		'--mz-line-title': '1.2',
		'--mz-color-bg': '#ffffff',
		'--mz-color-text': '#1a1a1a',
		'--mz-color-muted': '#5c5c5c',
		'--mz-color-faint': '#8a8a8a',
		'--mz-color-grid': '#e4e4e4',
		'--mz-color-axis': '#9a9a9a',
		'--mz-color-accent': '#2a78d6',
		'--mz-color-border': '#e4e4e4',
		'--mz-color-tooltip-bg': '#ffffff',
		'--mz-shadow-floating': '0 2px 8px rgb(0 0 0 / 0.12)',
		'--mz-grid-dash': 'none',
		'--mz-radius': '4px',
		'--mz-radius-floating': '4px',
		'--mz-gap': '0.75rem'
	},
	palettes: {
		categorical: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'],
		sequential: ['#dceafa', '#a9cbf2', '#6aa4e6', '#2a78d6', '#164f96'],
		diverging: ['#2a78d6', '#e6e6e3', '#e34948'],
		semantic: {
			positive: '#1baf7a',
			negative: '#e34948',
			neutral: '#9a9a9a',
			highlight: '#2a78d6',
			context: '#c8c8c8'
		}
	},
	plot: {
		initialWidth: 640,
		height: 320,
		padding: { top: 8, right: 16, bottom: 28, left: 40 },
		ticks: 5,
		tickSize: 0,
		tickPadding: 6,
		axisLine: false,
		lineWidth: 2,
		barRadius: 3,
		barMaxThickness: 24,
		fontSize: 12
	},
	breakpoints: { s: 0, m: 480, l: 720 },
	defaultLocale: 'en',
	print: {
		// Typical newspaper column widths.
		widths: { column: 55, double: 115, page: 180 },
		tokens: {
			'--mz-size-title': '11pt',
			'--mz-size-subtitle': '8pt',
			'--mz-size-body': '7.5pt',
			'--mz-size-small': '6.5pt',
			'--mz-size-axis': '6.5pt',
			'--mz-gap': '2mm'
		}
	}
};

/** Create a theme by overriding parts of another (the base theme by default). */
export function extendTheme(overrides: ThemeOverrides, parent: Theme = base): Theme {
	return {
		...parent,
		...overrides,
		tokens: { ...parent.tokens, ...overrides.tokens } as Theme['tokens'],
		palettes: {
			...parent.palettes,
			...overrides.palettes,
			semantic: { ...parent.palettes.semantic, ...overrides.palettes?.semantic }
		} as Theme['palettes'],
		plot: {
			...parent.plot,
			...overrides.plot,
			padding: { ...parent.plot.padding, ...overrides.plot?.padding }
		} as Theme['plot'],
		breakpoints: { ...parent.breakpoints, ...overrides.breakpoints } as Theme['breakpoints'],
		print: {
			widths: { ...parent.print.widths, ...overrides.print?.widths } as Theme['print']['widths'],
			tokens: { ...parent.print.tokens, ...overrides.print?.tokens } as Theme['print']['tokens']
		},
		fonts: (overrides.fonts as Theme['fonts']) ?? parent.fonts,
		logo: (overrides.logo as Theme['logo']) ?? parent.logo
	};
}
