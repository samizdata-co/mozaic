export { default as BarChart } from './BarChart.svelte';
export { default as ColumnChart } from './ColumnChart.svelte';
export { default as LineChart } from './LineChart.svelte';
export { default as ScatterChart } from './ScatterChart.svelte';
export { default as ArrowChart } from './ArrowChart.svelte';
export { default as BarDotChart } from './BarDotChart.svelte';
export { default as StackedBarChart } from './StackedBarChart.svelte';
export { default as MosaicChart } from './MosaicChart.svelte';
export { default as PercentileChart } from './PercentileChart.svelte';

/** Recipe names accepted by `mozaic eject`. */
export const recipes = [
	'BarChart',
	'ColumnChart',
	'LineChart',
	'ScatterChart',
	'ArrowChart',
	'BarDotChart',
	'StackedBarChart',
	'MosaicChart',
	'PercentileChart'
] as const;
