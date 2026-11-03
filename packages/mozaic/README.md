# mozaic

Chart components for the web and print, built on Svelte 5 and d3.

```bash
pnpm add mozaic d3-scale d3-array d3-shape
```

```svelte
<script lang="ts">
	import { scaleBand, scaleLinear } from 'd3-scale';
	import { Chart, Header, Title } from '@samizdata/mozaic/frame';
	import { Plot, Svg } from '@samizdata/mozaic/core';
	import { Bars } from '@samizdata/mozaic/marks';
	import { AxisX, AxisY } from '@samizdata/mozaic/guides';
	import { theme } from '../lib/theme'; // your house style: a Theme from extendTheme()
</script>

<Chart style={theme} locale="en" alt="…">
	<Header><Title>…</Title></Header>
	<Plot x={scaleLinear().domain([0, 100])} y={scaleBand().domain(['a', 'b'])} height={80}>
		<Svg><AxisX /><AxisY /><Bars data={rows} x={(d) => d.value} y={(d) => d.name} /></Svg>
	</Plot>
</Chart>
```

## Modules

| Import                          | Contents                                                                                                                                                                                            |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@samizdata/mozaic/core`        | `Plot`, `Svg`, `Html`, `Canvas`, `Facets`, `usePlot`, `useChart`, `useTheme`, `useLocale`, `scaled`, `position`, `mm`, `pt`                                                                         |
| `@samizdata/mozaic/frame`       | `Chart`, `Header`, `Title`, `Subtitle`, `Footer`, `Source`, `Notes`, `Byline`, `Logo`, `DataTable`, `DataDownload`                                                                                  |
| `@samizdata/mozaic/marks`       | `Bars`, `Line`, `Area`, `Points`, `Rects`, `Arcs`, `Text`, `Rules`, `GeoPath`, `Voronoi`, `LineEndLabels`, `Treemap`, `Waffle`, `Dumbbell`, `Arrows`, `Slope`, `Beeswarm`, `Hemicycle`, `Intervals` |
| `@samizdata/mozaic/guides`      | `AxisX`, `AxisY`, `GridX`, `GridY`, `Legend`, `ColorRamp`, `SizeLegend`, `Key`                                                                                                                      |
| `@samizdata/mozaic/annotations` | `Callout`, `Arrow`, `Label`, `RefLine`, `RefBand`                                                                                                                                                   |
| `@samizdata/mozaic/interactive` | `PointerArea`, `Tooltip`, `ButtonGroup`, `Scroller`                                                                                                                                                 |
| `@samizdata/mozaic/table`       | `Table`, `Sparkline`, `toCSV`                                                                                                                                                                       |
| `@samizdata/mozaic/transforms`  | `stack`, `bin`, `groupBy`, `rollup`, `indexTo`, `dodge`, `treemapLayout`, `avoidOverlap`, `hemicycleLayout`, `kernelSmooth`, `loess`                                                                |
| `@samizdata/mozaic/styles`      | `base`, `extendTheme`, `checkTheme`, `rampSteps`, `contrastRatio` (house styles live with each brand)                                                                                               |
| `@samizdata/mozaic/locale`      | `createLocale` (`en`, `ro`, `ru`)                                                                                                                                                                   |
| `@samizdata/mozaic/embed`       | `Embed`, `useEmbedParams`, `embedCode`, `hostScript`, `observeHeight`                                                                                                                               |
| `@samizdata/mozaic/export`      | `figureToSvg`, `downloadSvg`, `downloadPng`, `figureToPng`                                                                                                                                          |
| `@samizdata/mozaic/recipes`     | `BarChart`, `ColumnChart`, `LineChart`, `ScatterChart`, `ArrowChart`, `BarDotChart`, `StackedBarChart`, `MosaicChart`                                                                               |

Requires Svelte 5.57+. The full guides, API reference and gallery are in the repository's docs site.
