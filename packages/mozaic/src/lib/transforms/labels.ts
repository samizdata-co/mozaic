/**
 * Nudge 1-D label positions apart so neighbours are at least `gap` px apart,
 * keeping them inside [min, max] where possible. Returns positions in the
 * original order. Used for direct line labels. `sizes` gives labels of
 * several lines their room: a label of size 2 needs twice the gap.
 */
export function avoidOverlap(
	positions: number[],
	gap: number,
	[min, max]: [number, number] = [-Infinity, Infinity],
	sizes?: number[]
): number[] {
	const order = positions.map((p, i) => ({ p, i })).sort((a, b) => a.p - b.p);
	const placed = order.map((o) => Math.min(max, Math.max(min, o.p)));
	// With `sizes` (each label's height, in multiples of `gap`), neighbours are kept half of each apart.
	const size = (k: number) => sizes?.[order[k].i] ?? 1;
	const apart = (k: number) => (gap * (size(k - 1) + size(k))) / 2;
	const edge = (k: number) => (gap * (size(k) - 1)) / 2;

	// Push down from the top, then back up from the bottom if we ran past `max`.
	for (let k = 1; k < placed.length; k++) placed[k] = Math.max(placed[k], placed[k - 1] + apart(k));
	const last = placed.length - 1;
	if (placed.length && placed[last] > max - edge(last)) {
		placed[last] = max - edge(last);
		for (let k = last - 1; k >= 0; k--) placed[k] = Math.min(placed[k], placed[k + 1] - apart(k + 1));
	}

	const result = new Array<number>(positions.length);
	order.forEach((o, k) => (result[o.i] = placed[k]));
	return result;
}

/**
 * Break `text` at spaces into lines no wider than `maxWidth` (by `measure`), for a label that would
 * otherwise run off the chart. A word wider than `maxWidth` stays whole on its own line.
 */
export function wrapLabel(text: string, maxWidth: number, measure: (text: string) => number): string[] {
	if (measure(text) <= maxWidth) return [text];
	const lines: string[] = [];
	let line = '';
	for (const word of text.split(' ')) {
		const next = line ? `${line} ${word}` : word;
		if (line && measure(next) > maxWidth) {
			lines.push(line);
			line = word;
		} else line = next;
	}
	if (line) lines.push(line);
	return lines;
}
