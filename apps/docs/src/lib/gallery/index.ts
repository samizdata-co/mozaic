import type { Example } from './types';
import BudgetBars from './budget-bars/Chart.svelte';
import BudgetBarsSource from './budget-bars/Chart.svelte?raw';
import BudgetBarsData from './budget-bars/data.ts?raw';
import RegionalLines from './regional-lines/Chart.svelte';
import RegionalLinesSource from './regional-lines/Chart.svelte?raw';
import RegionalLinesData from './regional-lines/data.ts?raw';
import RaionMap from './raion-map/Chart.svelte';
import RaionMapSource from './raion-map/Chart.svelte?raw';
import RaionMapData from './raion-map/data.ts?raw';
import StackedColumns from './stacked-columns/Chart.svelte';
import StackedColumnsSource from './stacked-columns/Chart.svelte?raw';
import StackedColumnsData from './stacked-columns/data.ts?raw';
import GroupedBars from './grouped-bars/Chart.svelte';
import GroupedBarsSource from './grouped-bars/Chart.svelte?raw';
import GroupedBarsData from './grouped-bars/data.ts?raw';
import Scatter from './scatter/Chart.svelte';
import ScatterSource from './scatter/Chart.svelte?raw';
import ScatterData from './scatter/data.ts?raw';
import AreaBand from './area-band/Chart.svelte';
import AreaBandSource from './area-band/Chart.svelte?raw';
import AreaBandData from './area-band/data.ts?raw';
import Slope from './slope/Chart.svelte';
import SlopeSource from './slope/Chart.svelte?raw';
import SlopeData from './slope/data.ts?raw';
import Dumbbell from './dumbbell/Chart.svelte';
import DumbbellSource from './dumbbell/Chart.svelte?raw';
import DumbbellData from './dumbbell/data.ts?raw';
import Beeswarm from './beeswarm/Chart.svelte';
import BeeswarmSource from './beeswarm/Chart.svelte?raw';
import BeeswarmData from './beeswarm/data.ts?raw';
import Histogram from './histogram/Chart.svelte';
import HistogramSource from './histogram/Chart.svelte?raw';
import HistogramData from './histogram/data.ts?raw';
import Treemap from './treemap/Chart.svelte';
import TreemapSource from './treemap/Chart.svelte?raw';
import TreemapData from './treemap/data.ts?raw';
import Waffle from './waffle/Chart.svelte';
import WaffleSource from './waffle/Chart.svelte?raw';
import WaffleData from './waffle/data.ts?raw';
import SmallMultiples from './small-multiples/Chart.svelte';
import SmallMultiplesSource from './small-multiples/Chart.svelte?raw';
import SmallMultiplesData from './small-multiples/data.ts?raw';
import Heatmap from './heatmap/Chart.svelte';
import HeatmapSource from './heatmap/Chart.svelte?raw';
import HeatmapData from './heatmap/data.ts?raw';
import Donut from './donut/Chart.svelte';
import DonutSource from './donut/Chart.svelte?raw';
import DonutData from './donut/data.ts?raw';
import Table from './table/Chart.svelte';
import TableSource from './table/Chart.svelte?raw';
import TableData from './table/data.ts?raw';
import SymbolMap from './symbol-map/Chart.svelte';
import SymbolMapSource from './symbol-map/Chart.svelte?raw';
import SymbolMapData from './symbol-map/data.ts?raw';
import CanvasScatter from './canvas-scatter/Chart.svelte';
import CanvasScatterSource from './canvas-scatter/Chart.svelte?raw';
import CanvasScatterData from './canvas-scatter/data.ts?raw';
import Scrolly from './scrolly/Chart.svelte';
import Parliament from './parliament/Chart.svelte';
import ParliamentSource from './parliament/Chart.svelte?raw';
import ParliamentData from './parliament/data.ts?raw';
import PollTracker from './poll-tracker/Chart.svelte';
import PollTrackerSource from './poll-tracker/Chart.svelte?raw';
import PollTrackerData from './poll-tracker/data.ts?raw';
import ScrollySource from './scrolly/Chart.svelte?raw';
import ScrollyData from './scrolly/data.ts?raw';

/** Every gallery example, in display order. */
export const examples: Example[] = [
	{
		slug: 'budget-bars',
		title: 'Sorted bars with a callout',
		description:
			'Horizontal bars sorted by value, positive and negative colours, a curved-arrow callout, and labels above bars on small screens.',
		tags: ['bars', 'annotation', 'responsive'],
		component: BudgetBars,
		source: BudgetBarsSource,
		data: BudgetBarsData,
		print: ['column', 'double']
	},
	{
		slug: 'regional-lines',
		title: 'Lines with direct labels',
		description:
			'Four series with end labels that never overlap, a crosshair and a tooltip, and axis labels inside the plot on small screens.',
		tags: ['lines', 'tooltip', 'time'],
		component: RegionalLines,
		source: RegionalLinesSource,
		data: RegionalLinesData,
		print: ['column', 'double']
	},
	{
		slug: 'raion-map',
		title: 'Choropleth map',
		description: 'Moldova districts shaded with a threshold scale, a no-data colour, a legend and hover highlight.',
		tags: ['map', 'choropleth'],
		component: RaionMap,
		source: RaionMapSource,
		data: RaionMapData,
		print: ['column', 'double']
	},
	{
		slug: 'stacked-columns',
		title: 'Stacked columns with a toggle',
		description: 'Columns stacked by source, with a button group to switch between totals and shares.',
		tags: ['bars', 'stacked', 'interactive'],
		component: StackedColumns,
		source: StackedColumnsSource,
		data: StackedColumnsData,
		print: ['column', 'double']
	},
	{
		slug: 'grouped-bars',
		title: 'Grouped bars',
		description: 'Two series side by side in each band, with an inline legend in the subtitle.',
		tags: ['bars', 'grouped'],
		component: GroupedBars,
		source: GroupedBarsSource,
		data: GroupedBarsData,
		print: ['column', 'double']
	},
	{
		slug: 'scatter',
		title: 'Bubble scatter (recipe)',
		description:
			'The ScatterChart recipe: size and colour encodings, labelled points, Voronoi hover and a reference line.',
		tags: ['scatter', 'recipe'],
		component: Scatter,
		source: ScatterSource,
		data: ScatterData,
		print: ['column', 'double']
	},
	{
		slug: 'area-band',
		title: 'Area with a shaded period',
		description: 'A light area under a line, a shaded period, a target line and a nearest-point tooltip.',
		tags: ['area', 'annotation', 'time'],
		component: AreaBand,
		source: AreaBandSource,
		data: AreaBandData,
		print: ['column', 'double']
	},
	{
		slug: 'slope',
		title: 'Slope chart',
		description: 'Change between two dates for five regions, highlighting the exception.',
		tags: ['slope', 'comparison'],
		component: Slope,
		source: SlopeSource,
		data: SlopeData,
		print: ['column', 'double']
	},
	{
		slug: 'dumbbell',
		title: 'Dumbbell chart',
		description: 'Two values per category joined by a line: wages of women and men by sector.',
		tags: ['dumbbell', 'comparison'],
		component: Dumbbell,
		source: DumbbellSource,
		data: DumbbellData,
		print: ['column', 'double']
	},
	{
		slug: 'beeswarm',
		title: 'Beeswarm',
		description: 'One dot per district along a value axis, nudged so none overlap, with highlighted outliers.',
		tags: ['distribution', 'beeswarm'],
		component: Beeswarm,
		source: BeeswarmSource,
		data: BeeswarmData,
		print: ['column', 'double']
	},
	{
		slug: 'histogram',
		title: 'Histogram',
		description: 'Binned values drawn with Rects, with the median marked.',
		tags: ['distribution', 'histogram'],
		component: Histogram,
		source: HistogramSource,
		data: HistogramData,
		print: ['column', 'double']
	},
	{
		slug: 'treemap',
		title: 'Treemap',
		description: 'Squarified treemap grouped one level deep, with labels where they fit.',
		tags: ['part-to-whole', 'treemap'],
		component: Treemap,
		source: TreemapSource,
		data: TreemapData,
		print: ['column', 'double']
	},
	{
		slug: 'waffle',
		title: 'Waffle chart',
		description: '100 squares for parts of a whole.',
		tags: ['part-to-whole', 'waffle'],
		component: Waffle,
		source: WaffleSource,
		data: WaffleData,
		print: ['column', 'double']
	},
	{
		slug: 'small-multiples',
		title: 'Small multiples',
		description: 'Six panels with shared scales in a responsive grid.',
		tags: ['lines', 'facets'],
		component: SmallMultiples,
		source: SmallMultiplesSource,
		data: SmallMultiplesData,
		print: ['column', 'double']
	},
	{
		slug: 'heatmap',
		title: 'Heatmap',
		description: 'Month × year cells with a diverging colour scale and a colour ramp legend.',
		tags: ['heatmap', 'colour'],
		component: Heatmap,
		source: HeatmapSource,
		data: HeatmapData,
		print: ['column', 'double']
	},
	{
		slug: 'donut',
		title: 'Donut',
		description: 'Three slices with direct labels and a big number in the middle.',
		tags: ['part-to-whole', 'donut'],
		component: Donut,
		source: DonutSource,
		data: DonutData,
		print: ['column', 'double']
	},
	{
		slug: 'table',
		title: 'Table',
		description: 'Sortable, searchable table with inline bars, heat cells, sparklines and a CSV download.',
		tags: ['table'],
		component: Table,
		source: TableSource,
		data: TableData,
		print: ['column', 'double']
	},
	{
		slug: 'symbol-map',
		title: 'Proportional symbol map',
		description: 'Circles sized by area at district centroids, with a size legend.',
		tags: ['map', 'symbols'],
		component: SymbolMap,
		source: SymbolMapSource,
		data: SymbolMapData,
		print: ['column', 'double']
	},
	{
		slug: 'canvas-scatter',
		title: 'Canvas scatter (5,000 points)',
		description: 'A canvas layer for many points, SVG axes, and an SVG sample for print.',
		tags: ['scatter', 'canvas', 'performance'],
		component: CanvasScatter,
		source: CanvasScatterSource,
		data: CanvasScatterData,
		print: ['column', 'double']
	},
	{
		slug: 'poll-tracker',
		title: 'Poll tracker',
		description:
			'A kernel-weighted poll average with 95% bands (kernelSmooth), the individual polls as dots, a threshold line, end labels and a crosshair.',
		tags: ['lines', 'polls', 'smoothing', 'time'],
		component: PollTracker,
		source: PollTrackerSource,
		data: PollTrackerData,
		print: ['column', 'double']
	},
	{
		slug: 'parliament',
		title: 'Parliament (hemicycle)',
		description:
			'One dot per seat in half-rings, party by party, with a majority line, the total in the middle and hover on a party.',
		tags: ['parliament', 'elections', 'parts of a whole'],
		component: Parliament,
		source: ParliamentSource,
		data: ParliamentData,
		print: ['column', 'double']
	},
	{
		slug: 'scrolly',
		title: 'Scrollytelling story',
		description: 'A sticky chart that changes as the reader scrolls through steps. A full page, not an embed.',
		tags: ['story', 'scrolly'],
		component: Scrolly,
		source: ScrollySource,
		data: ScrollyData,
		kind: 'story'
	}
];

export function getExample(slug: string): Example | undefined {
	return examples.find((e) => e.slug === slug);
}
