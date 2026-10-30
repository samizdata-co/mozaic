# mozaic

A chart library for the web and print, built on Svelte 5 and d3: small, composable components on top of plain d3 scales, house styles for **SAMIZDATA**, **Ziarul de Gardă** and **Plebiscit.md**, self-sizing static embeds, and SVG/PDF/PNG export.

- **Any chart.** `Chart` → `Plot` → layers → marks. Scales are d3 scales; marks, axes, legends and annotations are ordinary components you can copy and change, or replace with raw SVG.
- **Styles and languages.** One prop switches the house style (fonts, colours, palettes) and the language (en, ro, ru: number and date formats, UI strings).
- **Embeds.** Each chart prerenders to a static page that shows without JavaScript and resizes its iframe through `embed.js`.
- **Print.** The same chart renders at print widths in millimetres; `mozaic export` writes SVG with editable text, vector PDF and PNG.
- **One repo per story.** `create-mozaic` scaffolds R/Python data scripts plus charts, a preview page, embed routes and a deploy workflow.
- **Built for AI authors.** Typed props with JSDoc, `AGENTS.md`, a Claude Code skill in every project, and `llms.txt`.

## Packages

| Package                                            | What                                                                                                                                                                       |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`packages/mozaic`](packages/mozaic)               | The library (`mozaic/core`, `/frame`, `/marks`, `/guides`, `/annotations`, `/interactive`, `/table`, `/transforms`, `/styles`, `/locale`, `/embed`, `/export`, `/recipes`) |
| [`packages/cli`](packages/cli)                     | `mozaic export` (SVG/PDF/PNG) and `mozaic eject`                                                                                                                           |
| [`packages/create-mozaic`](packages/create-mozaic) | Project scaffolder and template                                                                                                                                            |
| [`apps/docs`](apps/docs)                           | Docs site: guides, API reference, gallery of 20 examples, embeds, `llms.txt`                                                                                               |

## Quick start

```bash
pnpm install
pnpm dev                 # docs site and gallery at http://localhost:5173
```

Start an analysis project from a local checkout:

```bash
pnpm --filter mozaic package
node packages/create-mozaic/bin/create-mozaic.js ../budget-2026 --style zdg --locales ro,ru \
  --mozaic ./packages/mozaic --cli ./packages/cli
```

## A chart

```svelte
<script lang="ts">
	import { scaleBand, scaleLinear } from 'd3-scale';
	import { Chart, Header, Title, Footer, Source } from 'mozaic/frame';
	import { Plot, Svg } from 'mozaic/core';
	import { Bars } from 'mozaic/marks';
	import { AxisX, AxisY, GridX } from 'mozaic/guides';

	const data = [
		{ city: 'Chișinău', value: 30 },
		{ city: 'Bălți', value: 12 }
	];
	const x = scaleLinear().domain([0, 30]);
	const y = scaleBand()
		.domain(data.map((d) => d.city))
		.padding(0.25);
</script>

<Chart style="zdg" locale="ro" alt="Two cities compared">
	<Header><Title>Chișinău is far ahead</Title></Header>
	<Plot {x} {y} height={80} padding={{ left: 70 }}>
		<Svg>
			<GridX /><AxisX /><AxisY />
			<Bars {data} x={(d) => d.value} y={(d) => d.city} />
		</Svg>
	</Plot>
	<Footer><Source>Example</Source></Footer>
</Chart>
```

## Development

```bash
pnpm check        # type-check every package
pnpm test         # unit, server-render, gallery and CLI tests
pnpm lint         # ESLint
pnpm format       # Prettier
pnpm build        # package the library and build the docs site
pnpm test:e2e     # Playwright end-to-end and accessibility tests (after build)
pnpm export       # export every docs embed to SVG/PDF/PNG
```

See [AGENTS.md](AGENTS.md) for conventions, [PLAN.md](PLAN.md) for the design, and [docs/adr](docs/adr) for decisions. The written guides are in [apps/docs/src/content](apps/docs/src/content).

> The SAMIZDATA style follows the SAMIZDATA brand system (v1.0.0); the Ziarul de Gardă style follows the zdg.md site design. See the Styles guide for the sources and documented adaptations. All example data is synthetic.
