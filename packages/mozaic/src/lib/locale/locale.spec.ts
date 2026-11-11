import { describe, expect, it } from 'vitest';
import { createLocale, multiTimeFormat } from './index.js';

describe('createLocale', () => {
	it('formats numbers with each locale’s separators', () => {
		expect(createLocale('en').number(1234567.5)).toBe('1,234,567.5');
		expect(createLocale('ro').number(1234567.5)).toBe('1.234.567,5');
		expect(createLocale('ru').number(1234567.5)).toBe('1 234 567,5');
	});

	it('decimals and money: fixed decimals, none for whole numbers', () => {
		const ro = createLocale('ro');
		expect(ro.money(26.14)).toBe('26,14');
		expect(ro.money(12.3)).toBe('12,30');
		expect(ro.money(26)).toBe('26');
		expect(ro.money(10.999)).toBe('11');
		expect(ro.money(3788)).toBe('3.788');
		expect(ro.money(-1.5)).toBe('−1,50');
		expect(ro.decimals(1)(8.46)).toBe('8,5');
		expect(ro.decimals(1)(11.03)).toBe('11');
		expect(createLocale('en').money(1234.5)).toBe('1,234.50');
	});

	it('formats percentages and signs with a true minus', () => {
		const ro = createLocale('ro');
		expect(ro.percent(0.125)).toBe('13%');
		expect(ro.signedPercent(0.2)).toBe('+20%');
		expect(ro.signedPercent(-0.05)).toBe('−5%');
	});

	it('formats currency in lei for Moldova', () => {
		expect(createLocale('ro').format('$,.0f')(1500)).toBe('1.500 lei');
		expect(createLocale('ru').format('$,.0f')(1500)).toBe('1 500 лей');
	});

	it('uses localised month names', () => {
		const date = new Date(2024, 2, 1);
		expect(createLocale('ro').timeFormat('%B %Y')(date)).toBe('martie 2024');
		expect(createLocale('ru').timeFormat('%B %Y')(date)).toBe('март 2024');
		expect(createLocale('en').timeFormat('%B %Y')(date)).toBe('March 2024');
	});

	it('provides translated UI strings', () => {
		expect(createLocale('ro').strings.showAll(12)).toContain('12');
		expect(createLocale('ru').strings.source).toBe('Источник');
	});

	it('caches locales and rejects unknown codes', () => {
		expect(createLocale('en')).toBe(createLocale('en'));
		expect(() => createLocale('xx' as never)).toThrow(/Unknown mozaic locale/);
	});
});

describe('multiTimeFormat', () => {
	it('shows years on 1 January, months on the 1st, days otherwise', () => {
		const fmt = multiTimeFormat(createLocale('ro'));
		expect(fmt(new Date(2024, 0, 1))).toBe('2024');
		expect(fmt(new Date(2024, 4, 1))).toBe('mai');
		expect(fmt(new Date(2024, 4, 15))).toBe('15 mai');
	});
});
