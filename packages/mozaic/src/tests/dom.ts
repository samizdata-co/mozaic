import { parseHTML } from 'linkedom';
import { render } from 'svelte/server';
import type { Component } from 'svelte';

/** Server-render a component and return a queryable document. */
// Generic components (e.g. recipes) can't infer their type parameter here, so props are untyped.
export function renderDocument(component: Component<any>, props: Record<string, unknown> = {}) {
	const { body } = render(component, { props });
	const { document } = parseHTML(`<!doctype html><html><body>${body}</body></html>`);
	return {
		body,
		document,
		$: (s: string) => document.querySelector(s),
		$$: (s: string) => [...document.querySelectorAll(s)]
	};
}
