<!-- section: Build -->

# Languages

Locale is separate from style: a Ziarul de Gardă chart can be built in Romanian and in Russian, a SAMIZDATA chart in English.

Built-in locales: `en` (en-GB), `ro` (ro-MD) and `ru` (ru-MD). In `ro` and `ru` the currency is the Moldovan leu.

## Formatting

`<Chart locale="ro">` sets the chart's `lang` attribute, number and date formats, and UI strings. Axes and tables use the locale automatically. In chart code, use `createLocale(locale)` (or `useLocale()` inside a chart):

```ts
const fmt = createLocale('ro');
fmt.number(1234.5); // "1.234,5"
fmt.percent(0.125); // "13%"
fmt.signedPercent(-0.05); // "−5%"
fmt.format('$,.0f')(1500); // "1.500 lei"
fmt.timeFormat('%B %Y')(date); // "martie 2024"
```

|              | en          | ro          | ru          |
| ------------ | ----------- | ----------- | ----------- |
| 1234567.5    | 1,234,567.5 | 1.234.567,5 | 1 234 567,5 |
| Source label | Source      | Sursa       | Источник    |

Minus signs are true minus signs (−), not hyphens.

## Translating chart text

Keep every user-facing string in a `messages` object keyed by locale, next to the chart:

```ts
export const messages: Record<LocaleCode, { title: string; subtitle: string; alt: string }> = {
	en: { title: 'Turnout rose', subtitle: '…', alt: '…' },
	ro: { title: 'Prezența a crescut', subtitle: '…', alt: '…' },
	ru: { title: 'Явка выросла', subtitle: '…', alt: '…' }
};
```

Translate category names too (regions, sectors), including in tooltips, legends and data tables. The analysis project builds one embed per language.

## Adding a locale

Add an entry to `packages/mozaic/src/lib/locale/definitions.ts` with the d3-format and d3-time-format definitions and the UI strings, then add a test to `locale.spec.ts`.
