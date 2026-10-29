<!-- section: Start -->

# Getting started

mozaic is a chart library for the web and print. You build each chart from small Svelte components on top of plain d3 scales, in one of the house styles (SAMIZDATA, Ziarul de Gardă), and publish it as a static embed or export it for print.

## Start a new analysis project

Each piece of analysis lives in its own repository: R or Python scripts for the data, and Svelte files for one or two charts.

```bash
pnpm create mozaic budget-2026 --style zdg --locales ro,ru --title "Budget 2026"
cd budget-2026
pnpm install
pnpm dev
```

Open http://localhost:5173 to see the preview page with the example chart. Until mozaic is published to a registry, point the project at a local checkout:

```bash
pnpm create mozaic budget-2026 --mozaic ../mozaic/packages/mozaic --cli ../mozaic/packages/cli
```

Then build `mozaic` once in the library checkout (`pnpm --filter mozaic package`).

## What you get

```
analysis/        R and Python scripts: data/raw → data/processed
data/processed/  tidy CSV files the charts read
src/charts/      one folder per chart, registered in src/charts/index.ts
mozaic.config.ts project name, style, languages, public URL
```

The workflow is:

1. Wrangle data in `analysis/` and write tidy CSV to `data/processed/`.
2. Write the chart in `src/charts/<slug>/Chart.svelte`, starting from a [gallery](../../gallery/) example.
3. Preview it at every width, in every language and in print (`pnpm dev`).
4. `pnpm build` writes static embeds to `build/`; deploy that folder anywhere.
5. `pnpm export` writes SVG, PDF and PNG files for print and social media.

## Your first chart

A chart is a `<Chart>` frame around a `<Plot>`, with layers of marks:

```svelte
<script lang="ts">
	import { scaleBand, scaleLinear } from 'd3-scale';
	import { Chart, Header, Title, Footer, Source } from 'mozaic/frame';
	import { Plot, Svg } from 'mozaic/core';
	import { Bars } from 'mozaic/marks';
	import { AxisX, AxisY, GridX } from 'mozaic/guides';

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

<Chart style="zdg" locale="ro" alt="Bars comparing three cities">
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

For common charts there are also ready-made [recipes](../concepts/#recipes): `BarChart`, `ColumnChart`, `LineChart`, `ScatterChart`, `ArrowChart` and `BarDotChart`.

## Next

- [Concepts](../concepts/): how `Chart`, `Plot`, scales, layers and marks fit together.
- [Gallery](../../gallery/): twenty complete examples to copy.
- [API](../../api/): every component and prop.
