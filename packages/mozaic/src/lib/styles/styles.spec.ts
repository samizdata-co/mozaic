import { describe, expect, it } from 'vitest';
import { base, breakpointFor, checkTheme, contrastRatio, extendTheme, rampSteps, tokensToStyle } from './index.js';

describe('styles', () => {
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

	it('checks a house style', () => {
		expect(checkTheme(base)).toEqual([]);
		const broken = extendTheme({
			name: 'broken',
			label: 'Broken',
			tokens: { '--mz-color-muted': '#bbbbbb' },
			palettes: { categorical: ['#000000', 'red'] }
		});
		delete (broken.tokens as Record<string, string>)['--mz-radius'];
		expect(checkTheme(broken)).toEqual([
			'Missing tokens: --mz-radius.',
			'The categorical palette has 2 colours; it needs at least 5.',
			'The categorical palette has colours that are not #rrggbb: red.',
			'--mz-color-muted has 1.92:1 contrast on the background; it needs 4.5:1.'
		]);
	});

	it('serialises tokens for an inline style', () => {
		expect(tokensToStyle({ '--mz-a': '1', '--mz-b': 'red' })).toBe('--mz-a: 1; --mz-b: red');
	});

	it('maps widths to breakpoints', () => {
		expect(breakpointFor(320, base.breakpoints)).toBe('s');
		expect(breakpointFor(480, base.breakpoints)).toBe('m');
		expect(breakpointFor(1000, base.breakpoints)).toBe('l');
	});
});

describe('colour helpers', () => {
	it('computes WCAG contrast', () => {
		expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0);
		expect(contrastRatio('#ffffff', '#ffffff')).toBe(1);
	});

	it('picks ramp steps that are visible on the background, keeping brand colours', () => {
		const paper = ['#f8edf2', '#edcad8', '#dda0b9', '#c96891', '#ad3267', '#8b0c48', '#5d002e'];
		const steps = rampSteps(paper, 5, '#fbf9f4');
		expect(steps).toEqual(['#dda0b9', '#c96891', '#ad3267', '#8b0c48', '#5d002e']);
		for (const c of steps) expect(contrastRatio(c, '#fbf9f4')).toBeGreaterThanOrEqual(2);
		expect(rampSteps(['#94b9e8', '#6699dd', '#3a7bcd', '#0158b5', '#10357f', '#002853'], 3)).toEqual([
			'#94b9e8',
			'#0158b5',
			'#002853'
		]);
		expect(rampSteps(['#eeeeee', '#999999'], 2)).toEqual(['#eeeeee', '#999999']);
	});
});
