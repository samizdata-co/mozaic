import type { Medium } from '../styles/types.js';

/**
 * Query parameters an embed page understands, read in the browser after
 * hydration (prerendered pages cannot read the query string):
 * `?medium=print&width=208` (width in px).
 */
export function useEmbedParams(): { readonly medium: Medium; readonly width: number | undefined } {
	let medium = $state<Medium>('web');
	let width = $state<number | undefined>();
	$effect(() => {
		// Read once; nothing needs to react to this object.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const params = new URLSearchParams(window.location.search);
		if (params.get('medium') === 'print') medium = 'print';
		const w = Number(params.get('width'));
		if (w > 0) width = w;
	});
	return {
		get medium() {
			return medium;
		},
		get width() {
			return width;
		}
	};
}
