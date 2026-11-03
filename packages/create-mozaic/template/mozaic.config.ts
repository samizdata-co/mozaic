import type { LocaleCode } from '@samizdata/mozaic/locale';

/** Project settings. Charts are registered in src/charts/index.ts. */
export const config = {
	/** Used in URLs and file names. */
	project: '__PROJECT_NAME__',
	title: '__PROJECT_TITLE__',
	/** Languages to build. The first is the default. */
	locales: __LOCALES__ as LocaleCode[],
	/**
	 * Public URL where `build/` will be deployed, with a trailing slash, e.g.
	 * `https://charts.example.com/__PROJECT_NAME__/`. Used for embed codes.
	 */
	baseUrl: ''
};
