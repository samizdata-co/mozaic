import type { GeoPath, GeoPermissibleObjects, GeoProjection } from 'd3-geo';
import type { Locale } from '../locale/index.js';
import type { Breakpoint, Medium, Padding, Theme } from '../styles/types.js';

export type { Breakpoint, Medium, Padding };

/**
 * Any d3 scale that maps a data value to a pixel position:
 * linear, log, sqrt, symlog, time, utc, band, point, identity, …
 */
export interface PositionScale {
	(value: any): number | undefined;
	domain(): any[];
	range(): number[];
	range(range: Iterable<number>): this;
	copy(): this;
	bandwidth?(): number;
	invert?(value: number): any;
	ticks?(count?: number): any[];
}

/** Sizes passed to scale, range and projection factories. */
export interface Dimensions {
	/** Plot-area width (inside the padding). */
	width: number;
	/** Plot-area height (inside the padding). */
	height: number;
	padding: Padding;
	fullWidth: number;
	fullHeight: number;
	breakpoint: Breakpoint;
}

/** A d3 scale (Plot sets its range), or a factory that returns a fully configured scale. */
export type ScaleInput = PositionScale | ((dims: Dimensions) => PositionScale);
export type RangeInput = [number, number] | ((dims: Dimensions) => [number, number]);
/** A d3 projection, or a factory that returns a fitted projection. */
export type ProjectionInput = GeoProjection | ((dims: Dimensions) => GeoProjection);

/** What `usePlot()` returns. All values are reactive. */
export interface PlotContext {
	readonly width: number;
	readonly height: number;
	readonly padding: Padding;
	readonly fullWidth: number;
	readonly fullHeight: number;
	/** False during server rendering, before the container has been measured. */
	readonly measured: boolean;
	readonly breakpoint: Breakpoint;
	readonly medium: Medium;
	/** Position scales with ranges set. Identity scales (pixels) when none were given. */
	readonly x: PositionScale;
	readonly y: PositionScale;
	/** Extra named scales (colour, radius, …). */
	readonly scales: Record<string, any>;
	readonly projection: GeoProjection | undefined;
	/** `geoPath` bound to the projection; undefined when there is no projection. */
	readonly path: GeoPath<any, GeoPermissibleObjects> | undefined;
}

/** What `useChart()` returns. All values are reactive. */
export interface ChartContext {
	readonly theme: Theme;
	readonly locale: Locale;
	readonly medium: Medium;
	readonly breakpoint: Breakpoint;
	/** Chart width in px (initial width until measured). */
	readonly width: number;
	readonly measured: boolean;
	/** Element ids used for ARIA wiring. */
	readonly ids: {
		title: string;
		desc: string;
		/** Set by `<Title>` as it renders, so the SVG is only labelled by a title that exists. */
		hasTitle?: boolean;
		/** Whether the chart has alt text (rendered with the `desc` id). */
		readonly hasDesc?: boolean;
	};
}
