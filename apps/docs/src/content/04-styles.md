<!-- section: Build -->

# Styles

A house style is a `Theme` object: CSS tokens for type and colours, palettes for data, defaults for plots, breakpoints, print settings, web fonts, a logo and a default language. Charts pick one with `<Chart style="zdg">`.

Built-in styles: `samizdata`, `zdg`, `moldova-alege` and the neutral `base`.

## SAMIZDATA

From the SAMIZDATA brand system (`samizdata/brand`, v1.0.0): `_brand.yml`, `css/tokens.css` and `datavis/tokens.yml`.

- **Type:** Space Grotesk for titles and labels, Work Sans for text, axes and tooltips (loaded from Bunny Fonts).
- **Colour:** warm paper background `#fbf9f4`, ink `#1b1c19`, muted `#574146`, dried-raspberry accent `#9f1853`.
- **Data palettes:** the brand's categorical (8), sequential (7, raspberry) and diverging (teal ↔ raspberry) scales, unchanged.
- **Shape:** sharp corners everywhere, dotted gridlines (`2 2`), uppercase tracked "data label" voice for Source/Note labels, table headers, facet titles and buttons.
- **Logo:** the three-bar mark with the uppercase `SAMIZDATA` wordmark.

Documented chart adaptations (see `styles/samizdata.ts`):

- Titles use weight 700: Space Grotesk on Bunny Fonts stops at 700, although the brand lists 900.
- Titles use line height 1 and −0.02em tracking (the brand's display settings are 0.95 and −0.04em) because chart titles wrap and carry Romanian diacritics.
- Work Sans 700 is loaded for the data-vis "strong" weight.

> **Known brand issues.** The brand's first two categorical colours, raspberry `#9f1853` and teal `#28666e`, are hard to tell apart with deuteranopia (ΔE 5.3; the floor is 6), and they are also the diverging poles. Slots 5–6 and 7–8 are close for colour-blind readers too, and the lightest sequential step is almost invisible on the paper background (1.09:1). mozaic uses the palette as defined. Always pair colour with labels, and fix the palette in the brand system if needed. Space Grotesk and Work Sans have no Cyrillic, so Russian charts set Cyrillic letters in the system sans.

## Ziarul de Gardă

From the zdg.md site design (October 2026).

- **Type:** Source Serif Pro 600 for titles (the site's headlines), Source Sans Pro for everything else, with Cyrillic support.
- **Colour:** white background, near-black text `#171717`, grey `#585858` for secondary text, brand blue `#0158b5`, pale blue `#cdd7ee` gridlines, blue-grey `#718ba7` axes.
- **Data palettes:** the site has no published chart palette. The categorical palette starts with the brand blue and coral (`#0158b5`, `#ff595a`) and adds amber, teal, violet and light blue; slots 1–4 pass the colour-blindness checks for all pairs. The sequential ramp runs from a pale blue (at least 2:1 on white) through the brand blue to the site's navies (`#10357f`, `#002853`). The diverging scale is blue ↔ coral with a neutral grey midpoint.
- **Shape:** pill-shaped buttons with uppercase labels, as on the site.
- **Logo:** the "spune adevărul / zdg / ZIARUL de GARDĂ" wordmark from the site, optimised to 5.5 KB.

## Moldova Alege

For the Moldova Alege poll tracker, where party colours carry the meaning in nearly every chart.

- **Type:** IBM Plex Serif 600 for titles, IBM Plex Sans for everything else (Romanian diacritics and Cyrillic), from Bunny Fonts.
- **Colour:** white background, ink `#161a22`, slate `#4b5262` for secondary text and a dark slate accent `#2b3a55`. The chrome stays neutral on purpose: yellow, red, blue, teal and plum all belong to parties.
- **Data palettes:** party colours are not in the style; projects key them by party. The categorical palette is for everything else: slots 1–4 (blue, orange, teal, plum) pass the colour-blindness checks for all pairs on white, slots 5–6 (light blue, amber) are below 3:1 and need labels. The diverging scale is orange ↔ blue with a warm grey midpoint, not red ↔ green, because a yes or no on a political question is not good or bad. The sequential ramp is blue.
- **Logo:** a small parliament of 24 seats with the majority side in ink, and the `Moldova Alege` wordmark.

## Fonts

A style can name a web-font stylesheet (`theme.fonts.stylesheet`). `<Chart>` adds it to the page head, so embeds and exports get the right fonts. Pass `loadFonts={false}` when the page already loads them. Exports wait for fonts to load before rendering.

## Tokens

Tokens become CSS custom properties on the chart's `<figure>`. Components use them as `var(--mz-…)`:

| Token                                                                                            | Use                                                       |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| `--mz-font-title`, `--mz-weight-title`, `--mz-line-title`, `--mz-tracking-title`                 | chart title                                               |
| `--mz-font-body`                                                                                 | text, axes, tooltips                                      |
| `--mz-font-label`, `--mz-weight-label`, `--mz-label-transform`, `--mz-label-tracking`            | labels: "Source:", legend and facet titles, table headers |
| `--mz-control-transform`, `--mz-control-tracking`                                                | button text                                               |
| `--mz-weight-strong`                                                                             | emphasised data text (end labels, values)                 |
| `--mz-size-title`, `--mz-size-subtitle`, `--mz-size-body`, `--mz-size-small`, `--mz-size-axis`   | type scale                                                |
| `--mz-color-bg`, `--mz-color-text`, `--mz-color-muted`, `--mz-color-faint`                       | surface and text                                          |
| `--mz-color-grid`, `--mz-grid-dash`, `--mz-color-axis`, `--mz-color-accent`, `--mz-color-border` | gridlines, axes, accent, borders                          |
| `--mz-color-tooltip-bg`, `--mz-shadow-floating`, `--mz-radius-floating`                          | tooltips and cards                                        |
| `--mz-radius`                                                                                    | buttons and controls (swatches use at most 2px)           |
| `--mz-gap`                                                                                       | spacing between header, plot and footer                   |

## Palettes

- `categorical`: a fixed order of hues. Assign colours by entity, in order, and never cycle past the end; fold extra series into "Other" or use small multiples.
- `sequential`: one hue, light to dark (5 or more steps), for magnitudes. For binned data use `rampSteps(theme.palettes.sequential, n, background)`. It returns `n` of the style's own colours, skipping steps too pale to see on the background.
- `diverging`: `[negative, neutral, positive]`, for values around a midpoint.
- `semantic`: `positive`, `negative`, `neutral`, `highlight` and `context` (the colour for everything you are not talking about). `highlight` can equal the first categorical colour (it does in SAMIZDATA), so don't rely on them differing.

Text never uses a data colour. A coloured swatch, dot or line next to the text carries the identity. `contrastRatio(a, b)` helps pick fills that can carry white labels.

## Plot defaults

`theme.plot` holds `padding`, `ticks`, `tickSize`, `tickPadding`, `axisLine`, `lineWidth`, `barRadius`, `barMaxThickness`, `fontSize` (used for text-width estimates), `initialWidth` (server rendering) and `height`.

## Adding a style

```ts
// packages/mozaic/src/lib/styles/acme.ts
import { extendTheme } from './base.js';
import { acmeLogo } from './logos/acme.js';

export const acme = extendTheme({
	name: 'acme',
	label: 'ACME Daily',
	tokens: { '--mz-font-title': "'Acme Serif', Georgia, serif", '--mz-color-accent': '#b00020' },
	palettes: { categorical: ['#b00020', '#1f4e79', '#e8a33d', '#2f8f6f', '#6a4c93'] },
	fonts: { stylesheet: 'https://fonts.bunny.net/css?family=acme-serif:600&display=swap' },
	logo: { label: 'ACME Daily', svg: acmeLogo, height: 20 },
	defaultLocale: 'en'
});
```

Register it in `styles/index.ts` (`styles = { base, samizdata, zdg, acme }`). Unit tests check that every token is defined and that text colours are readable on the background.

You can also pass a theme object directly: `<Chart style={acme}>`.

### Logos

Inline SVG keeps embeds self-contained and exports editable. Optimise the file (svgo), remove element ids (several charts share a page) and `<title>` (the logo component adds the accessible name), and keep it to a few kilobytes.

### Checking colours

Before adding a categorical palette, check it for colour-blind separation, lightness and contrast. The first three or four slots should stay distinguishable even when every pair is on screen together (scatter plots, maps), not just adjacent ones. Check that the lightest sequential step is visible on the background.

## Print settings

`theme.print.widths` names the column widths in millimetres (`column: 55`, `double: 115`, `page: 180` by default). `theme.print.tokens` overrides tokens in print, with sizes in points. See [Print and export](../print-and-export/).
