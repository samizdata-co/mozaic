export { default as Plot } from './Plot.svelte';
export { default as Svg } from './Svg.svelte';
export { default as Html } from './Html.svelte';
export { default as Canvas } from './Canvas.svelte';
export { default as Facets } from './Facets.svelte';
export {
	setChartContext,
	setDownloads,
	setInitialWidth,
	setPlotContext,
	useChart,
	useDownloads,
	useInitialWidth,
	useLocale,
	usePlot,
	useTheme
} from './context.js';
export { estimateTextWidth, isOrdinal, isScale, position, scaled } from './scales.js';
export { mm, pt, PX_PER_MM } from './units.js';
export { access, type Accessor, type Value } from './accessor.js';
export type {
	Breakpoint,
	ChartContext,
	Dimensions,
	Medium,
	Padding,
	PlotContext,
	PositionScale,
	ProjectionInput,
	RangeInput,
	ScaleInput
} from './types.js';
