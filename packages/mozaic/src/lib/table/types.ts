export interface Column<T> {
	/** Unique id for the column. */
	key: string;
	label: string;
	value: (d: T) => unknown;
	/** Text shown in the cell; defaults to locale number formatting for numbers. */
	format?: (value: any, d: T) => string;
	/** Defaults to right for numbers, left otherwise. */
	align?: 'left' | 'right' | 'center';
	sortable?: boolean;
	/**
	 * Cell display: plain text, an inline bar (numbers), a heat cell coloured by
	 * `color`, or a sparkline from `series`.
	 */
	type?: 'text' | 'bar' | 'heat' | 'sparkline';
	/** For `bar`: the value that fills the cell; defaults to the column maximum. */
	max?: number;
	/** For `heat` (and optionally `bar`): value → CSS colour. */
	color?: (value: any, d: T) => string;
	/** For `sparkline`: the values to plot. */
	series?: (d: T) => number[];
	/** CSS width, e.g. "30%". */
	width?: string;
	/** Include in the search filter (text columns by default). */
	searchable?: boolean;
}
