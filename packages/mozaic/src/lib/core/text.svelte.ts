import { estimateTextWidth } from './scales.js';

let context: CanvasRenderingContext2D | null | undefined;
// eslint-disable-next-line svelte/prefer-svelte-reactivity -- a plain cache; `generation` in useTextWidth carries the reactivity
const cache = new Map<string, number>();

/**
 * Width in pixels of one line of `text` in a CSS `font` (`'12px "Source Sans 3", sans-serif'`),
 * measured with a canvas. `undefined` where there is no canvas (server rendering) or the font
 * can't be parsed (a `var()` in it, say).
 */
export function measureTextWidth(text: string, font: string): number | undefined {
	if (typeof document === 'undefined' || font.includes('var(')) return undefined;
	context ??= document.createElement('canvas').getContext('2d');
	if (!context) return undefined;
	const key = `${font}\n${text}`;
	let width = cache.get(key);
	if (width === undefined) {
		context.font = font;
		width = context.measureText(text).width;
		cache.set(key, width);
	}
	return width;
}

/**
 * Text widths for laying out a chart, such as the gutter for row labels. Call it while a
 * component initialises; it returns `(text, fontSize, family?) => width`, the widest line
 * for text broken with `\n`. Until the component
 * mounts (and in server rendering) the width is `estimateTextWidth`'s, so hydration matches the
 * server's markup; then it is measured in `family`, and measured again when web fonts finish
 * loading. Use it inside `$derived` so layouts follow.
 */
export function useTextWidth(): (text: string, fontSize: number, family?: string) => number {
	const widest = (text: string, width: (line: string) => number) => Math.max(...text.split('\n').map(width));
	let generation = $state(0);
	$effect(() => {
		generation = 1;
		const fonts = typeof document === 'undefined' ? undefined : document.fonts;
		if (!fonts) return;
		const remeasure = () => {
			cache.clear();
			generation += 1;
		};
		fonts.addEventListener('loadingdone', remeasure);
		void fonts.ready.then(remeasure);
		return () => fonts.removeEventListener('loadingdone', remeasure);
	});
	return (text, fontSize, family = 'sans-serif') =>
		widest(text, (line) =>
			generation === 0
				? estimateTextWidth(line, fontSize)
				: (measureTextWidth(line, `${fontSize}px ${family}`) ?? estimateTextWidth(line, fontSize))
		);
}
