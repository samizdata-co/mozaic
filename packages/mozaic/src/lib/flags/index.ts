/**
 * Square flags for the `Flag` and `Flags` marks, `Beeswarm`, `BarChart` and `StripChart`, drawn
 * as circles in the style of ggflags. Each export is a country's flag as inner SVG markup on a
 * 512 × 512 viewBox, named by its upper-case ISO 3166-1 alpha-2 code (`MD`, `RO`), plus `EU`,
 * `UN` and Eurostat's `EL` (Greece) and `UK` (United Kingdom).
 *
 * Import only the flags a chart uses, so the others stay out of the bundle:
 *
 * ```ts
 * import { MD, RO, UA } from '@samizdata/mozaic/flags';
 * const flags: Record<string, string> = { MD, RO, UA };
 * ```
 *
 * Flags from flag-icons (https://github.com/lipis/flag-icons), MIT License.
 */
export * from './svgs.js';
