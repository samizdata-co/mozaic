/** One prerendered embed page: a chart in one style and language. */
export interface EmbedEntry {
	slug: string;
	style: string;
	locale: string;
	title: string;
	/** Path relative to the site root, with a trailing slash, e.g. `embed/budget/ro/`. */
	path: string;
	/** Print widths to export, name → millimetres. */
	print: Record<string, number>;
}

/** Written to `embed/manifest.json` at build time; read by `mozaic export`. */
export interface EmbedManifest {
	project: string;
	embeds: EmbedEntry[];
}
