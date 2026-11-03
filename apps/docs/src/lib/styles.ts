import { base } from '@samizdata/mozaic/styles';
import type { Theme } from '@samizdata/mozaic/styles';
// Copied from samizdata-co/brand and ziaruldegarda/brand (datavis/mozaic/); do not edit the copies.
import { samizdata } from './brands/samizdata/theme.js';
import { zdg } from './brands/zdg/theme.js';

/** House styles the docs site can show. mozaic itself ships only `base`. */
export const styles = { base, samizdata, zdg } satisfies Record<string, Theme>;
export type StyleName = keyof typeof styles;
