import { formatLocale } from 'd3-format';
import { timeFormatLocale } from 'd3-time-format';
import { definitions, type LocaleDefinition, type LocaleStrings } from './definitions.js';

export { definitions };
export type { LocaleDefinition, LocaleStrings };
export type LocaleCode = keyof typeof definitions;

export interface Locale {
	code: LocaleCode;
	/** BCP 47 tag for the `lang` attribute. */
	lang: string;
	strings: LocaleStrings;
	/** d3-format specifier → formatter, using this locale's separators. */
	format(specifier: string): (n: number) => string;
	/** d3-time-format specifier → formatter, using this locale's month and day names. */
	timeFormat(specifier: string): (d: Date) => string;
	/** 1234.5 → "1,234.5" (en) / "1.234,5" (ro) / "1 234,5" (ru). Trailing zeros removed. */
	number: (n: number) => string;
	/**
	 * Exactly `digits` decimals, except that a value which rounds to a whole number at that
	 * precision has none: `decimals(1)` gives 8.46 → "8.5" and 11.03 → "11" (not "11.0").
	 * Use it for one rounding level across a chart without "26.0" or "26.00".
	 */
	decimals(digits: number): (n: number) => string;
	/** Money: two decimals, or none when the value is a whole number (26.14 → "26.14", 26 → "26", 12.3 → "12.30"). */
	money: (n: number) => string;
	/** 0.123 → "12%". */
	percent: (n: number) => string;
	/** 0.123 → "+12%"; −0.05 → "−5%". */
	signedPercent: (n: number) => string;
}

const cache = new Map<LocaleCode, Locale>();

export function createLocale(code: LocaleCode): Locale {
	const cached = cache.get(code);
	if (cached) return cached;
	const def: LocaleDefinition = definitions[code];
	if (!def) throw new Error(`Unknown mozaic locale "${code}". Known locales: ${Object.keys(definitions).join(', ')}`);
	const numbers = formatLocale(def.number);
	const times = timeFormatLocale(def.time);
	const decimals = (digits: number) => {
		const withDecimals = numbers.format(`,.${digits}f`);
		const whole = numbers.format(',.0f');
		return (n: number) => {
			const rounded = Number(n.toFixed(digits));
			return Number.isInteger(rounded) ? whole(rounded) : withDecimals(n);
		};
	};
	const locale: Locale = {
		code,
		lang: def.lang,
		strings: def.strings,
		format: (specifier) => numbers.format(specifier),
		timeFormat: (specifier) => times.format(specifier),
		number: numbers.format(',~f'),
		decimals,
		money: decimals(2),
		percent: numbers.format('.0%'),
		signedPercent: numbers.format('+.0%')
	};
	cache.set(code, locale);
	return locale;
}

/** Default tick label for a date: the year on 1 January, the month on the 1st, otherwise day and month. */
export function multiTimeFormat(locale: Locale): (d: Date) => string {
	const year = locale.timeFormat('%Y');
	const month = locale.timeFormat('%b');
	const day = locale.timeFormat('%e %b');
	return (d) => (d.getMonth() === 0 && d.getDate() === 1 ? year(d) : d.getDate() === 1 ? month(d) : day(d));
}
