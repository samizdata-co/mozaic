<!-- section: Build -->

# Styles

A house style is a `Theme` object: CSS tokens for type and colours, palettes for data, defaults for plots, breakpoints, print settings, web fonts, a logo and a default language. Charts take one with `<Chart style={theme}>`.

mozaic ships only the neutral `base` style. Each outlet keeps its house style with its own brand, so a project can use any style without changing the library:

| Style           | Where it lives                               |
| --------------- | -------------------------------------------- |
| SAMIZDATA       | `samizdata-co/brand`, in `datavis/mozaic/`   |
| Ziarul de Gardă | `ziaruldegarda/brand`, in `datavis/mozaic/`  |
| Plebiscit.md    | the Plebiscit.md site, in `src/lib/theme.ts` |

The docs site shows the SAMIZDATA and Ziarul de Gardă styles from copies in `apps/docs/src/lib/brands/`: pick one in the Style menu. Each brand's README describes its style and the adaptations it makes for charts.

## Using a house style

Copy the brand's `datavis/mozaic/` folder into the project, for example to `src/lib/brand/`, and pass its theme to every chart:

```svelte
<script lang="ts">
	import { Chart } from '@samizdata/mozaic/frame';
	import { samizdata } from '../lib/brand/theme';
</script>

<Chart style={samizdata} locale="en" alt="…">…</Chart>
```

Don't edit the copy: update it from a brand release and review the change. Projects created with maia for an outlet get the copy automatically and update it with `copier update`. A chart without a `style` uses `base`.

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

## Writing a style

A style extends `base` (or another style) with `extendTheme()`. Put it in the outlet's brand repository, next to its other design tokens, or in the project (`charts/src/lib/theme.ts`) when only one project uses it:

```ts
import { extendTheme } from '@samizdata/mozaic/styles';
import { acmeLogo } from './logo.js';

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

`name` is set as `data-mz-style` on the chart and names the export folders. `checkTheme(acme)` lists its problems as sentences (missing tokens, short or invalid palettes, unreadable text colours); add `expect(checkTheme(acme)).toEqual([])` to the tests where the style lives.

### Logos

Inline SVG keeps embeds self-contained and exports editable. Optimise the file (svgo), remove element ids (several charts share a page) and `<title>` (the logo component adds the accessible name), and keep it to a few kilobytes.

### Checking colours

Before adding a categorical palette, check it for colour-blind separation, lightness and contrast. The first three or four slots should stay distinguishable even when every pair is on screen together (scatter plots, maps), not just adjacent ones. Check that the lightest sequential step is visible on the background.

## Print settings

`theme.print.widths` names the column widths in millimetres (`column: 55`, `double: 115`, `page: 180` by default). `theme.print.tokens` overrides tokens in print, with sizes in points. See [Print and export](../print-and-export/).
