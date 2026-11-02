import type { LocaleCode } from '../locale/index.js';

export type Breakpoint = 's' | 'm' | 'l';
export type Medium = 'web' | 'print';

export interface Padding {
	top: number;
	right: number;
	bottom: number;
	left: number;
}

/**
 * A house style. Visual tokens become CSS custom properties on `<Chart>`;
 * everything that scales, marks and formatters need as values lives in the
 * other fields and is read with `useTheme()`.
 */
export interface Theme {
	/** Machine name, set as `data-mz-style` on the chart. */
	name: string;
	/** Human-readable name. */
	label: string;
	/** CSS custom properties applied to `<Chart>`. Keys start with `--mz-`. */
	tokens: Record<`--mz-${string}`, string>;
	palettes: {
		/** Fixed order; assign by entity, never cycle past the end. */
		categorical: string[];
		/** Single hue, light → dark. */
		sequential: string[];
		/** [negative pole, neutral midpoint, positive pole]. */
		diverging: [string, string, string];
		semantic: {
			positive: string;
			negative: string;
			neutral: string;
			highlight: string;
			/** De-emphasised marks (the "everything else" grey). */
			context: string;
		};
	};
	plot: {
		/** Width used for server rendering, before the container is measured. */
		initialWidth: number;
		/** Default plot-area height when `<Plot>` gets no height or aspectRatio. */
		height: number;
		padding: Padding;
		ticks: number;
		tickSize: number;
		tickPadding: number;
		/** Draw the axis baseline. */
		axisLine: boolean;
		lineWidth: number;
		/** Corner radius on the data end of bars. */
		barRadius: number;
		/** Bars never get thicker than this, whatever the band size. */
		barMaxThickness: number;
		/** Font size in px used by SVG text and text-width estimates. */
		fontSize: number;
	};
	/** Minimum chart width (px) for each breakpoint. */
	breakpoints: Record<Breakpoint, number>;
	defaultLocale: LocaleCode;
	/** Print medium: named widths in millimetres and token overrides (sizes in pt). */
	print: {
		widths: Record<string, number>;
		tokens: Partial<Record<`--mz-${string}`, string>>;
	};
	/** Web fonts the style needs; `<Chart>` adds the stylesheet to the page head. */
	fonts?: { stylesheet: string };
	/** House logo for the chart footer: an inline SVG mark, a text wordmark, or both. */
	logo?: {
		/** Accessible name, e.g. "SAMIZDATA". */
		label: string;
		/** Inline SVG markup (trusted, from the style file). */
		svg?: string;
		/** Wordmark text set in the label font, shown after the SVG. */
		text?: string;
		/** Rendered height of the SVG in px. */
		height?: number;
		/** Where the logo links to (opens in a new tab, so it works from embeds). */
		href?: string;
	};
}

type DeepPartial<T> = {
	[K in keyof T]?: T[K] extends unknown[] ? T[K] : T[K] extends object ? DeepPartial<T[K]> : T[K];
};
export type ThemeOverrides = DeepPartial<Theme> & { name: string; label: string };
