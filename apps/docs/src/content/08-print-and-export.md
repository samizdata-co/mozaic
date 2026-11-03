<!-- section: Publish -->

# Print and export

The same chart file renders for print. Print mode:

- uses a fixed width in millimetres (`mm(55)` converts to CSS pixels),
- applies the style's print tokens (sizes in points),
- drops interactive parts: tooltips, pointer areas, buttons, data tables.

```svelte
<script>
	import { mm } from 'mozaic/core';
</script>

<MyChart style={theme} locale="ro" medium="print" width={mm(55)} />
```

The preview page and the docs gallery have a print switch.

## mozaic export

```bash
pnpm build
pnpm export          # = mozaic export build
```

For every embed listed in `build/embed/manifest.json`, `mozaic export` opens the page in a headless Chromium and writes:

| File                | What                                                               |
| ------------------- | ------------------------------------------------------------------ |
| `web.png`           | the chart at 640 px, 2× resolution, for social media and fallbacks |
| `web.svg`           | the whole chart (title, plot, footer) as one SVG                   |
| `print-<width>.svg` | the chart at each print width, editable in Illustrator or Inkscape |
| `print-<width>.pdf` | vector PDF at the exact size, fonts embedded                       |

Options: `--out <dir>`, `--only <slug,slug>`, `--formats svg,pdf,png`, `--web-width <px>` and `--browser <path>`.

### Browser

The exporter uses, in order: `--browser`, `$MOZAIC_BROWSER`, Playwright's Chromium (`npx playwright install chromium`), any other Chromium in Playwright's cache, then common system locations. It tries each until one starts.

## SVG details

`figureToSvg(figure)` (from `mozaic/export`, also behind the SVG buttons) converts the rendered chart:

- SVG layers are copied with computed styles inlined, so no CSS is needed.
- HTML text (title, subtitle, legend, footer) becomes SVG `<text>`, one element per rendered line with words positioned exactly, so it stays editable.
- Elements with a background colour (legend swatches) become rectangles.

If the designer does not have the fonts, open the SVG or PDF and convert text to outlines in Illustrator or Inkscape.

The download buttons under a chart (`<Chart download>`, see [Embedding](../embedding/)) add 20 px of space around it (`figureToSvg(figure, { padding })` for your own). Their PNGs embed the web fonts the chart uses, so the text looks as it does on the page; the SVGs name the fonts without embedding them.

## Colour

Exports are RGB. Print palettes are chosen to survive conversion; colour management (CMYK, PDF/X) is left to the print designer.
