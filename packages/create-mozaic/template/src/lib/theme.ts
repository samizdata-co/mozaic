import { extendTheme } from 'mozaic/styles';

/**
 * The house style for every chart in this project. It starts from mozaic's
 * neutral `base`; change tokens, palettes and the logo here. To use an outlet's
 * style instead, copy its brand's `datavis/mozaic/` folder to `src/lib/brand/`
 * (do not edit the copy) and re-export it:
 *
 *     export { samizdata as theme } from './brand/theme.js';
 */
export const theme = extendTheme({ name: '__PROJECT_NAME__', label: '__PROJECT_TITLE__' });
