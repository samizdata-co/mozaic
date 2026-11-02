import { getContext, setContext } from 'svelte';
import { createLocale, type Locale } from '../locale/index.js';
import { base, breakpointFor } from '../styles/index.js';
import type { Theme } from '../styles/types.js';
import type { ChartContext, PlotContext } from './types.js';

const CHART = Symbol('mozaic:chart');
const PLOT = Symbol('mozaic:plot');
const INITIAL_WIDTH = Symbol('mozaic:initial-width');
const EMBEDDED = Symbol('mozaic:embedded');
const DOWNLOADS = Symbol('mozaic:downloads');

/** Used when a component renders outside `<Chart>` (tests, quick sketches). */
const fallbackChart: ChartContext = {
	theme: base,
	locale: createLocale(base.defaultLocale),
	medium: 'web',
	breakpoint: breakpointFor(base.plot.initialWidth, base.breakpoints),
	width: base.plot.initialWidth,
	measured: false,
	ids: { title: '', desc: '' }
};

export function setChartContext(ctx: ChartContext): void {
	setContext(CHART, ctx);
}

/** The surrounding `<Chart>`'s theme, locale, medium and breakpoint. Falls back to the base style. */
export function useChart(): ChartContext {
	return getContext<ChartContext | undefined>(CHART) ?? fallbackChart;
}

/** The active house style. Read properties inside `$derived` or markup so they stay reactive. */
export function useTheme(): Theme {
	const chart = useChart();
	return new Proxy({} as Theme, { get: (_, key) => chart.theme[key as keyof Theme] });
}

/** The active locale's formatters and strings. */
export function useLocale(): Locale {
	const chart = useChart();
	return new Proxy({} as Locale, { get: (_, key) => chart.locale[key as keyof Locale] });
}

export function setPlotContext(ctx: PlotContext): void {
	setContext(PLOT, ctx);
}

/** Dimensions, scales and projection of the surrounding `<Plot>`. */
export function usePlot(): PlotContext {
	const ctx = getContext<PlotContext | undefined>(PLOT);
	if (!ctx) throw new Error('usePlot() must be called inside a <Plot>.');
	return ctx;
}

/** Layout components (e.g. `<Facets>`) tell nested plots their expected width before measurement. */
export function setInitialWidth(get: () => number): void {
	setContext(INITIAL_WIDTH, get);
}

export function useInitialWidth(): (() => number) | undefined {
	return getContext<(() => number) | undefined>(INITIAL_WIDTH);
}

/** `<Embed>` marks its charts as embedded, so they leave out controls meant for the chart's own site. */
export function setEmbedded(): void {
	setContext(EMBEDDED, true);
}

export function useEmbedded(): boolean {
	return getContext<boolean | undefined>(EMBEDDED) ?? false;
}

/**
 * Show "Download PNG · SVG" under every chart inside this component (a site's layout, say), unless a chart
 * sets `<Chart download={false}>`. Charts inside `<Embed>` never show it.
 */
export function setDownloads(on = true): void {
	setContext(DOWNLOADS, on);
}

export function useDownloads(): boolean {
	return getContext<boolean | undefined>(DOWNLOADS) ?? false;
}
