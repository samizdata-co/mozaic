import { describe, expect, it } from 'vitest';
import {
	base,
	breakpointFor,
	contrastRatio,
	extendTheme,
	plebiscit,
	rampSteps,
	resolveStyle,
	samizdata,
	styles,
	tokensToStyle,
	zdg
} from './index.js';

describe('styles', () => {
	it('registers the house styles', () => {
		expect(Object.keys(styles)).toEqual(['base', 'samizdata', 'zdg', 'plebiscit']);
		expect(resolveStyle('plebiscit')).toBe(plebiscit);
		expect(resolveStyle('zdg')).toBe(zdg);
		expect(resolveStyle(samizdata)).toBe(samizdata);
		expect(() => resolveStyle('nope' as never)).toThrow(/Unknown mozaic style/);
	});

	it('extends the base theme without losing nested defaults', () => {
		const custom = extendTheme({
			name: 'x',
			label: 'X',
			plot: { barRadius: 0 },
			palettes: { semantic: { positive: '#000' } }
		});
		expect(custom.plot.barRadius).toBe(0);
		expect(custom.plot.lineWidth).toBe(base.plot.lineWidth);
		expect(custom.palettes.semantic.positive).toBe('#000');
		expect(custom.palettes.semantic.negative).toBe(base.palettes.semantic.negative);
		expect(custom.tokens['--mz-color-bg']).toBe(base.tokens['--mz-color-bg']);
		expect(custom.print.widths.column).toBe(55);
	});

	it('defines every token and enough categorical colours in every style', () => {
		for (const theme of Object.values(styles)) {
			expect(Object.keys(theme.tokens).sort()).toEqual(Object.keys(base.tokens).sort());
			expect(theme.palettes.categorical.length).toBeGreaterThanOrEqual(5);
			expect(theme.palettes.sequential.length).toBeGreaterThanOrEqual(5);
			for (const c of [...theme.palettes.categorical, ...theme.palettes.sequential])
				expect(c).toMatch(/^#[0-9a-f]{6}$/i);
		}
	});

	it('serialises tokens for an inline style', () => {
		expect(tokensToStyle({ '--mz-a': '1', '--mz-b': 'red' })).toBe('--mz-a: 1; --mz-b: red');
	});

	it('maps widths to breakpoints', () => {
		expect(breakpointFor(320, base.breakpoints)).toBe('s');
		expect(breakpointFor(480, base.breakpoints)).toBe('m');
		expect(breakpointFor(1000, base.breakpoints)).toBe('l');
	});

	it('uses the SAMIZDATA brand tokens (samizdata/brand v1.0.0)', () => {
		expect(samizdata.tokens['--mz-font-title']).toContain('Space Grotesk');
		expect(samizdata.tokens['--mz-font-body']).toContain('Work Sans');
		expect(samizdata.tokens['--mz-color-bg']).toBe('#fbf9f4');
		expect(samizdata.palettes.categorical).toEqual([
			'#9f1853',
			'#28666e',
			'#c26d3a',
			'#60569b',
			'#67823a',
			'#a64b37',
			'#397c8c',
			'#8a6075'
		]);
		expect(samizdata.palettes.diverging).toEqual(['#28666e', '#f0eee9', '#9f1853']);
		expect(samizdata.logo?.label).toBe('SAMIZDATA');
		expect(samizdata.fonts?.stylesheet).toMatch(/^https:\/\/fonts\.bunny\.net\/css\?family=space-grotesk/);
	});

	it('uses the Ziarul de Gardă site design', () => {
		expect(zdg.tokens['--mz-font-title']).toContain('Source Serif Pro');
		expect(zdg.tokens['--mz-font-body']).toContain('Source Sans Pro');
		expect(zdg.palettes.categorical.slice(0, 2)).toEqual(['#0158b5', '#ff595a']);
		expect(zdg.logo?.svg).toMatch(/^<svg[^>]*viewBox="0 0 84 48"/);
		expect(zdg.logo?.svg).not.toContain('id=');
	});

	it('uses the Plebiscit.md identity', () => {
		expect(plebiscit.tokens['--mz-font-title']).toContain('IBM Plex Serif');
		expect(plebiscit.tokens['--mz-font-body']).toContain('IBM Plex Sans');
		expect(plebiscit.defaultLocale).toBe('ro');
		expect(plebiscit.logo?.text).toBe('Plebiscit.md');
		expect(plebiscit.logo?.svg).toMatch(/^<svg[^>]*viewBox="0 0 36 20"/);
		expect(plebiscit.logo?.svg).not.toContain('id=');
		// The diverging poles are not red and green: a yes or no is not good or bad.
		expect(plebiscit.palettes.diverging).toEqual(['#d4691e', '#e6e4df', '#2a6fb0']);
	});

	it('keeps text colours readable on each style’s background', () => {
		for (const theme of Object.values(styles)) {
			const bg = theme.tokens['--mz-color-bg'];
			expect(contrastRatio(theme.tokens['--mz-color-text'], bg), theme.name).toBeGreaterThanOrEqual(7);
			expect(contrastRatio(theme.tokens['--mz-color-muted'], bg), theme.name).toBeGreaterThanOrEqual(4.5);
		}
	});
});

describe('colour helpers', () => {
	it('computes WCAG contrast', () => {
		expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0);
		expect(contrastRatio('#ffffff', '#ffffff')).toBe(1);
	});

	it('picks ramp steps that are visible on the background, keeping brand colours', () => {
		const steps = rampSteps(samizdata.palettes.sequential, 5, '#fbf9f4');
		expect(steps).toEqual(['#dda0b9', '#c96891', '#ad3267', '#8b0c48', '#5d002e']);
		for (const c of steps) expect(contrastRatio(c, '#fbf9f4')).toBeGreaterThanOrEqual(2);
		expect(rampSteps(zdg.palettes.sequential, 3)).toEqual(['#94b9e8', '#0158b5', '#002853']);
		expect(rampSteps(['#eeeeee', '#999999'], 2)).toEqual(['#eeeeee', '#999999']);
	});
});
