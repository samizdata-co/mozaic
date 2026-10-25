/** Message an embedded chart posts to its parent page whenever its height changes. */
export interface ResizeMessage {
	type: 'mozaic:resize';
	/** Identifies the embed; defaults to its URL path. */
	id: string;
	height: number;
}

export function postHeight(height: number, id: string): void {
	if (typeof window === 'undefined' || window.parent === window) return;
	const message: ResizeMessage = { type: 'mozaic:resize', id, height };
	window.parent.postMessage(message, '*');
	// Also speak Datawrapper's protocol, so hosts that already run its listener resize our embeds too.
	window.parent.postMessage({ 'datawrapper-height': { [id]: height } }, '*');
}

/**
 * Post the element's height to the parent page now and whenever it changes.
 * Returns a function that stops observing. Does nothing outside an iframe.
 */
export function observeHeight(element: HTMLElement, id: string = location.pathname): () => void {
	if (window.parent === window) return () => {};
	let last = 0;
	const send = () => {
		const height = Math.ceil(element.getBoundingClientRect().height);
		if (height !== last) {
			last = height;
			postHeight(height, id);
		}
	};
	const observer = new ResizeObserver(send);
	observer.observe(element);
	send();
	return () => observer.disconnect();
}
