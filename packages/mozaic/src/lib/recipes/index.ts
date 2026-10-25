export { default as BarChart } from './BarChart.svelte';
export { default as ColumnChart } from './ColumnChart.svelte';
export { default as LineChart } from './LineChart.svelte';
export { default as ScatterChart } from './ScatterChart.svelte';

/** Recipe names accepted by `mozaic eject`. */
export const recipes = ['BarChart', 'ColumnChart', 'LineChart', 'ScatterChart'] as const;
