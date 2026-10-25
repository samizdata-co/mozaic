/**
 * Convert a rendered chart (`<figure class="mz-chart">`, HTML header and
 * footer included) into one standalone SVG. Runs in the browser: it reads
 * layout and computed styles from the live DOM.
 *
 * - SVG layers are copied with computed styles inlined (no CSS needed).
 * - HTML text becomes SVG `<text>`, one element per rendered line, so it
 *   stays editable in Illustrator or Inkscape.
 * - Elements with a background colour (legend swatches) become rectangles.
 * - Interactive-only parts (tooltips, buttons, data tables) are left out.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

const SVG_STYLE_PROPS = [
	'fill',
	'fill-opacity',
	'stroke',
	'stroke-width',
	'stroke-opacity',
	'stroke-dasharray',
	'stroke-linejoin',
	'stroke-linecap',
	'paint-order',
	'opacity',
	'font-family',
	'font-size',
	'font-weight',
	'font-style',
	'letter-spacing',
	'text-anchor',
	'dominant-baseline',
	'shape-rendering',
	'visibility'
];

const EXCLUDE = [
	'.mz-html',
	'.mz-visually-hidden',
	'.mz-button-group',
	'.mz-data-table',
	'.mz-data-download',
	'.mz-table-search',
	'.mz-table-more',
	'.mz-tooltip',
	'[data-mz-export="exclude"]',
	'script',
	'style',
	'button',
	'input',
	'select',
	'textarea'
].join(',');

function escapeXml(text: string): string {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function transparent(color: string): boolean {
	return !color || color === 'transparent' || /rgba\([^)]*,\s*0\)$/.test(color);
}

function hidden(el: Element): boolean {
	if (el.closest(EXCLUDE)) return true;
	const cs = getComputedStyle(el);
	return cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0;
}

function inlineSvg(svg: SVGSVGElement, x: number, y: number, width: number, height: number): string {
	const clone = svg.cloneNode(true) as SVGSVGElement;
	const source = [svg, ...svg.querySelectorAll('*')];
	const target = [clone, ...clone.querySelectorAll('*')];
	source.forEach((el, i) => {
		const out = target[i] as Element;
		const cs = getComputedStyle(el);
		const style = SVG_STYLE_PROPS.map((p) => `${p}:${cs.getPropertyValue(p)}`)
			.filter((s) => !s.endsWith(':'))
			.join(';');
		out.setAttribute('style', style);
		out.removeAttribute('class');
		out.removeAttribute('role');
		out.removeAttribute('aria-labelledby');
		out.removeAttribute('aria-describedby');
	});
	// Interactive-only SVG parts (matched on the source, which still has its classes).
	source.forEach((el, i) => {
		if (el.matches?.('.mz-pointer-area, .mz-voronoi')) target[i].remove();
	});
	clone.setAttribute('x', String(x));
	clone.setAttribute('y', String(y));
	clone.setAttribute('width', String(width));
	clone.setAttribute('height', String(height));
	clone.removeAttribute('style');
	clone.setAttribute('overflow', 'visible');
	return new XMLSerializer().serializeToString(clone);
}

function textLines(node: Text, origin: DOMRect): string[] {
	const parent = node.parentElement;
	if (!parent || !node.data.trim()) return [];
	const cs = getComputedStyle(parent);
	const fontSize = parseFloat(cs.fontSize);
	const transform = cs.textTransform;
	const range = document.createRange();
	const lines = new Map<number, { top: number; bottom: number; words: { x: number; text: string }[] }>();

	const re = /\S+/g;
	let match: RegExpExecArray | null;
	while ((match = re.exec(node.data))) {
		range.setStart(node, match.index);
		range.setEnd(node, match.index + match[0].length);
		const rect = range.getClientRects()[0];
		if (!rect || rect.width === 0) continue;
		const key = Math.round(rect.top);
		const line = lines.get(key) ?? { top: rect.top, bottom: rect.bottom, words: [] };
		let text = match[0];
		if (transform === 'uppercase') text = text.toUpperCase();
		else if (transform === 'lowercase') text = text.toLowerCase();
		line.words.push({ x: rect.left - origin.left, text });
		lines.set(key, line);
	}

	const attrs = [
		`font-family="${escapeXml(cs.fontFamily)}"`,
		`font-size="${fontSize}"`,
		`font-weight="${cs.fontWeight}"`,
		cs.fontStyle !== 'normal' ? `font-style="${cs.fontStyle}"` : '',
		cs.letterSpacing !== 'normal' ? `letter-spacing="${cs.letterSpacing}"` : '',
		`fill="${cs.color}"`
	]
		.filter(Boolean)
		.join(' ');

	return [...lines.values()].map((line) => {
		// Baseline from the line box: centred glyphs, ~0.2em descent.
		const baseline = line.bottom - (line.bottom - line.top - fontSize) / 2 - fontSize * 0.2 - origin.top;
		const spans = line.words
			.map((w) => `<tspan x="${w.x.toFixed(2)}" y="${baseline.toFixed(2)}">${escapeXml(w.text)}</tspan>`)
			.join('');
		return `<text ${attrs} xml:space="preserve">${spans}</text>`;
	});
}

export function figureToSvg(figure: HTMLElement, options: { background?: boolean } = {}): string {
	const origin = figure.getBoundingClientRect();
	const width = Math.ceil(origin.width);
	const height = Math.ceil(origin.height);
	const parts: string[] = [];

	const bg = getComputedStyle(figure).backgroundColor;
	if (options.background !== false && !transparent(bg))
		parts.push(`<rect width="${width}" height="${height}" fill="${bg}"/>`);

	// Boxes with a background colour (legend swatches, keys, table bars).
	for (const el of figure.querySelectorAll('*')) {
		if (el.closest('svg') || hidden(el)) continue;
		const cs = getComputedStyle(el);
		if (transparent(cs.backgroundColor)) continue;
		const r = el.getBoundingClientRect();
		if (r.width === 0 || r.height === 0) continue;
		const radius = parseFloat(cs.borderTopLeftRadius) || 0;
		parts.push(
			`<rect x="${(r.left - origin.left).toFixed(2)}" y="${(r.top - origin.top).toFixed(2)}" width="${r.width.toFixed(2)}" height="${r.height.toFixed(2)}" rx="${Math.min(radius, r.width / 2, r.height / 2)}" fill="${cs.backgroundColor}"${cs.opacity !== '1' ? ` fill-opacity="${cs.opacity}"` : ''}/>`
		);
	}

	// SVG layers and SVG guides (outermost <svg> elements only).
	for (const svg of figure.querySelectorAll('svg')) {
		if (svg.parentElement?.closest('svg') || hidden(svg)) continue;
		const r = svg.getBoundingClientRect();
		parts.push(inlineSvg(svg as SVGSVGElement, r.left - origin.left, r.top - origin.top, r.width, r.height));
	}

	// HTML text.
	const walker = document.createTreeWalker(figure, NodeFilter.SHOW_TEXT);
	for (let node = walker.nextNode(); node; node = walker.nextNode()) {
		const parent = node.parentElement;
		if (!parent || parent.closest('svg') || hidden(parent)) continue;
		parts.push(...textLines(node as Text, origin));
	}

	return `<svg xmlns="${SVG_NS}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${parts.join('')}</svg>`;
}
