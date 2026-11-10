# mozaic

A chart library for the web and print, built on Svelte 5 and d3: small, composable components on top of plain d3 scales, any house style, self-sizing static embeds, and SVG/PDF/PNG export.

- **Any chart.** `Chart` → `Plot` → layers → marks. Scales are d3 scales; marks, axes, legends and annotations are ordinary components you can copy and change, or replace with raw SVG.
- **Styles and languages.** One prop switches the house style (fonts, colours, palettes: a `Theme` that lives with each outlet's brand) and the language (en, ro, ru: number and date formats, UI strings).
- **Embeds.** Each chart prerenders to a static page that shows without JavaScript and resizes its iframe through `embed.js`.
- **Print.** The same chart renders at print widths in millimetres; `mozaic export` writes SVG with editable text, vector PDF and PNG.
- **One repo per story.** [maia](https://github.com/samizdata-co/maia) creates the project: data scripts and notebooks, plus a `charts/` folder with a preview page, embed routes and a GitHub Pages deploy workflow.
- **Built for AI authors.** Typed props with JSDoc, `AGENTS.md`, a Claude Code skill in every project, and `llms.txt`.

## Packages

| Package                              | What                                                                                                                                                                                  |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`packages/mozaic`](packages/mozaic) | The library (`@samizdata/mozaic/core`, `/frame`, `/marks`, `/guides`, `/annotations`, `/interactive`, `/table`, `/transforms`, `/styles`, `/locale`, `/embed`, `/export`, `/recipes`) |
| [`packages/cli`](packages/cli)       | `mozaic export` (SVG/PDF/PNG) and `mozaic eject`                                                                                                                                      |
| [`apps/docs`](apps/docs)             | Docs site: guides, API reference, gallery of 20 examples, embeds, `llms.txt`                                                                                                          |

## Quick start

```bash
pnpm install
pnpm dev                 # docs site and gallery at http://localhost:5173
```

Start a project with charts linked to this checkout (with [maia](https://github.com/samizdata-co/maia)):

```bash
pnpm --filter mozaic package
uvx copier copy --trust --data charts=mozaic --data mozaic_path=$PWD gh:samizdata-co/maia ../budget-2026
```

## A chart

```svelte
<script lang="ts">
	import { scaleBand, scaleLinear } from 'd3-scale';
	import { Chart, Header, Title, Footer, Source } from '@samizdata/mozaic/frame';
	import { Plot, Svg } from '@samizdata/mozaic/core';
	import { Bars } from '@samizdata/mozaic/marks';
	import { AxisX, AxisY, GridX } from '@samizdata/mozaic/guides';
	import { theme } from '../lib/theme'; // the project's house style

	const data = [
		{ city: 'Chișinău', value: 30 },
		{ city: 'Bălți', value: 12 }
	];
	const x = scaleLinear().domain([0, 30]);
	const y = scaleBand()
		.domain(data.map((d) => d.city))
		.padding(0.25);
</script>

<Chart style={theme} locale="ro" alt="Two cities compared">
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

> mozaic ships only the neutral `base` style. House styles live with each outlet's brand: SAMIZDATA in `samizdata-co/brand` and Ziarul de Gardă in `ziaruldegarda/brand` (both in `datavis/mozaic/`), Plebiscit.md in its own repository. The docs site shows copies of the first two. [maia](https://github.com/samizdata-co/maia) creates analysis projects with an outlet's style. All example data is synthetic.
