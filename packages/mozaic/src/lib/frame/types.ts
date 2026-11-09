/** One source in `<Source sources={…}>` or a recipe's `source` prop. */
export interface SourceItem {
	/** What the reader sees, e.g. "ANRE" or "Eurostat (nrg_ti_gas)". */
	label: string;
	/** Link to the data or document. */
	href?: string;
}
