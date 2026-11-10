<!-- section: Start -->

# Getting started

mozaic is a chart library for the web and print. You build each chart from small Svelte components on top of plain d3 scales, in your outlet's house style, and publish it as a static embed or export it for print.

## Start a new analysis project

Each piece of analysis lives in its own repository, created with [maia](https://github.com/samizdata-co/maia) (a [Copier](https://copier.readthedocs.io/) template): R or Python scripts and notebooks for the data, and a `charts/` folder with one or two charts.

```bash
uvx copier copy --trust --data charts=mozaic gh:samizdata-co/maia budget-2026
cd budget-2026/charts
pnpm dev
```

Copier asks for the outlet (SAMIZDATA, Ziarul de Gardă or none), which sets the house style, and the chart languages. With `--trust` it runs `pnpm install` in `charts/`. Open http://localhost:5173 to see the preview page with the example chart. `uvx copier update --trust` later brings template changes, new mozaic versions and new brand releases into the project.

The project installs `@samizdata/mozaic` and `@samizdata/mozaic-cli` from npm. To work against a local checkout of the library instead, pass its absolute path:

```bash
uvx copier copy --trust --data charts=mozaic --data mozaic_path=$HOME/Projects/mozaic gh:samizdata-co/maia budget-2026
```

and build `@samizdata/mozaic` once in the library checkout (`pnpm --filter mozaic package`). The house style is in `charts/src/lib/theme.ts`; see [Styles](../styles/).

## What you get

```
etl/                    scripts that clean and process the data
docs/                   analysis notebook and the article
charts/data/            tidy CSV files the charts read
charts/src/charts/      one folder per chart, registered in charts/src/charts/index.ts
charts/mozaic.config.ts project name, languages, public URL
```

The workflow is:

1. Wrangle data in `etl/` or a notebook and write tidy CSV to `charts/data/`.
2. Write the chart in `charts/src/charts/<slug>/Chart.svelte`, starting from a [gallery](../../gallery/) example.
3. Preview it at every width, in every language and in print (`pnpm dev`).
4. `pnpm build` writes static embeds to `charts/build/`; the included workflow deploys them to GitHub Pages.
5. `pnpm export` writes SVG, PDF and PNG files for print and social media.

## Your first chart

A chart is a `<Chart>` frame around a `<Plot>`, with layers of marks:

```svelte
<script lang="ts">
	import { scaleBand, scaleLinear } from 'd3-scale';
	import { Chart, Header, Title, Footer, Source } from '@samizdata/mozaic/frame';
	import { Plot, Svg } from '@samizdata/mozaic/core';
	import { Bars } from '@samizdata/mozaic/marks';
	import { AxisX, AxisY, GridX } from '@samizdata/mozaic/guides';

	const data = [
		{ city: 'Chișinău', value: 30 },
		{ city: 'Bălți', value: 12 },
		{ city: 'Cahul', value: 8 }
	];
	const x = scaleLinear().domain([0, 30]);
	const y = scaleBand()
		.domain(data.map((d) => d.city))
		.padding(0.25);
</script>

<Chart locale="ro" alt="Bars comparing three cities">
	<Header><Title>Chișinău is far ahead</Title></Header>
	<Plot {x} {y} height={120} padding={{ left: 70 }}>
		<Svg>
			<GridX />
			<AxisX />
			<AxisY />
			<Bars {data} x={(d) => d.value} y={(d) => d.city} />
		</Svg>
	</Plot>
	<Footer><Source>Example</Source></Footer>
</Chart>
```

For common charts there are also ready-made [recipes](../concepts/#recipes): `BarChart`, `ColumnChart`, `LineChart`, `ScatterChart`, `ArrowChart`, `BarDotChart`, `StackedBarChart`, `MosaicChart` and `PercentileChart`.

## Next

- [Concepts](../concepts/): how `Chart`, `Plot`, scales, layers and marks fit together.
- [Gallery](../../gallery/): twenty complete examples to copy.
- [API](../../api/): every component and prop.
