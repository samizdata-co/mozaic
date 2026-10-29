# mozaic

Chart components for the web and print, built on Svelte 5 and d3.

```bash
pnpm add mozaic d3-scale d3-array d3-shape
```

```svelte
<script lang="ts">
	import { scaleBand, scaleLinear } from 'd3-scale';
	import { Chart, Header, Title } from 'mozaic/frame';
	import { Plot, Svg } from 'mozaic/core';
	import { Bars } from 'mozaic/marks';
	import { AxisX, AxisY } from 'mozaic/guides';
</script>

<Chart style="samizdata" locale="en" alt="…">
	<Header><Title>…</Title></Header>
	<Plot x={scaleLinear().domain([0, 100])} y={scaleBand().domain(['a', 'b'])} height={80}>
		<Svg><AxisX /><AxisY /><Bars data={rows} x={(d) => d.value} y={(d) => d.name} /></Svg>
	</Plot>
</Chart>
```

## Modules

| Import               | Contents                                                                                                                                                                                            |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mozaic/core`        | `Plot`, `Svg`, `Html`, `Canvas`, `Facets`, `usePlot`, `useChart`, `useTheme`, `useLocale`, `scaled`, `position`, `mm`, `pt`                                                                         |
| `mozaic/frame`       | `Chart`, `Header`, `Title`, `Subtitle`, `Footer`, `Source`, `Notes`, `Byline`, `Logo`, `DataTable`, `DataDownload`                                                                                  |
| `mozaic/marks`       | `Bars`, `Line`, `Area`, `Points`, `Rects`, `Arcs`, `Text`, `Rules`, `GeoPath`, `Voronoi`, `LineEndLabels`, `Treemap`, `Waffle`, `Dumbbell`, `Arrows`, `Slope`, `Beeswarm`, `Hemicycle`, `Intervals` |
| `mozaic/guides`      | `AxisX`, `AxisY`, `GridX`, `GridY`, `Legend`, `ColorRamp`, `SizeLegend`, `Key`                                                                                                                      |
| `mozaic/annotations` | `Callout`, `Arrow`, `Label`, `RefLine`, `RefBand`                                                                                                                                                   |
| `mozaic/interactive` | `PointerArea`, `Tooltip`, `ButtonGroup`, `Scroller`                                                                                                                                                 |
| `mozaic/table`       | `Table`, `Sparkline`, `toCSV`                                                                                                                                                                       |
| `mozaic/transforms`  | `stack`, `bin`, `groupBy`, `rollup`, `indexTo`, `dodge`, `treemapLayout`, `avoidOverlap`, `hemicycleLayout`, `kernelSmooth`, `loess`                                                                |
| `mozaic/styles`      | `samizdata`, `zdg`, `moldovaAlege`, `base`, `extendTheme`, `resolveStyle`                                                                                                                           |
| `mozaic/locale`      | `createLocale` (`en`, `ro`, `ru`)                                                                                                                                                                   |
| `mozaic/embed`       | `Embed`, `useEmbedParams`, `embedCode`, `hostScript`, `observeHeight`                                                                                                                               |
| `mozaic/export`      | `figureToSvg`, `downloadSvg`, `downloadPng`, `figureToPng`                                                                                                                                          |
| `mozaic/recipes`     | `BarChart`, `ColumnChart`, `LineChart`, `ScatterChart`, `ArrowChart`, `BarDotChart`                                                                                                                 |

Requires Svelte 5.57+. The full guides, API reference and gallery are in the repository's docs site.
