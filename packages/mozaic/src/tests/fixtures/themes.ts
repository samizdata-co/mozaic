import { extendTheme } from '../../lib/styles/index.js';

/** A house style with web fonts and a mark-plus-wordmark logo. */
export const paper = extendTheme({
	name: 'paper',
	label: 'Paper',
	tokens: { '--mz-color-bg': '#fbf9f4', '--mz-color-accent': '#9f1853' },
	fonts: { stylesheet: 'https://fonts.bunny.net/css?family=work-sans:400,700&display=swap' },
	logo: { label: 'PAPER', svg: '<svg viewBox="0 0 24 24" aria-hidden="true"></svg>', text: 'PAPER' }
});

/** A Romanian house style whose logo is an SVG wordmark only. */
export const gazeta = extendTheme({
	name: 'gazeta',
	label: 'Gazeta',
	logo: { label: 'Gazeta', svg: '<svg viewBox="0 0 84 48" aria-hidden="true"></svg>' },
	defaultLocale: 'ro'
});
