import { extendTheme } from './base.js';
import { plebiscitMark } from './logos/plebiscit.js';

/**
 * Plebiscit.md, a poll tracker for Moldova. The brand stays out of the way of
 * the data: party colours (yellow, red, blue, teal, plum) carry meaning in
 * every chart, so the chrome is ink and grey with a dark slate accent that no
 * party uses. IBM Plex Serif 600 titles and IBM Plex Sans text, both with
 * Romanian diacritics and Cyrillic.
 *
 * Party colours are not part of the style: they belong to the project, keyed by
 * party. The categorical palette here is for everything else; slots 1–4 pass
 * the colour-blindness checks for all pairs on white, and slots 5–6 (light blue
 * and amber) are below 3:1, so pair them with labels. The diverging scale is
 * orange ↔ blue with a warm grey midpoint, deliberately not red ↔ green: a yes
 * or no on a political question is not good or bad.
 */
export const plebiscit = extendTheme({
	name: 'plebiscit',
	label: 'Plebiscit.md',
	tokens: {
		'--mz-font-title': "'IBM Plex Serif', Georgia, serif",
		'--mz-font-body': "'IBM Plex Sans', system-ui, sans-serif",
		'--mz-font-label': "'IBM Plex Sans', system-ui, sans-serif",
		'--mz-weight-title': '600',
		'--mz-line-title': '1.2',
		'--mz-weight-label': '600',
		'--mz-weight-strong': '600',
		'--mz-size-title': '1.375rem',
		'--mz-color-bg': '#ffffff',
		'--mz-color-text': '#161a22',
		'--mz-color-muted': '#4b5262',
		'--mz-color-faint': '#6e7584',
		'--mz-color-grid': '#e3e5e9',
		'--mz-color-axis': '#9aa0ab',
		'--mz-color-accent': '#2b3a55',
		'--mz-color-border': '#dfe2e7',
		'--mz-shadow-floating': '0 4px 16px rgba(22, 26, 34, 0.12)',
		'--mz-radius': '6px',
		'--mz-radius-floating': '6px'
	},
	palettes: {
		categorical: ['#2a6fb0', '#d4691e', '#14a38b', '#8e2c6e', '#6ab2ee', '#c99700', '#c03a2b', '#6c5bb5'],
		sequential: ['#dbe6f2', '#b3cbe6', '#7fa6d4', '#4a7fbf', '#2a5c9a', '#173d6e', '#0d2647'],
		diverging: ['#d4691e', '#e6e4df', '#2a6fb0'],
		semantic: {
			positive: '#2a6fb0',
			negative: '#d4691e',
			neutral: '#8a909b',
			highlight: '#2b3a55',
			context: '#c5cad2'
		}
	},
	fonts: {
		stylesheet: 'https://fonts.bunny.net/css?family=ibm-plex-sans:400,500,600,700|ibm-plex-serif:600&display=swap'
	},
	logo: { label: 'Plebiscit.md', svg: plebiscitMark, text: 'Plebiscit.md', height: 18, href: 'https://plebiscit.md' },
	defaultLocale: 'ro'
});
