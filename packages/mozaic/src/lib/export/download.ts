import { figureToSvg, isExcluded } from './figure-to-svg.js';
import { embeddedFontStyle, usedFonts } from './fonts.js';

/** Space around a downloaded chart, in px, so its text does not touch the edge of the image. */
export const DOWNLOAD_PADDING = 20;

function save(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Download a rendered chart as SVG, with `padding` px around it. */
export function downloadSvg(figure: HTMLElement, filename = 'chart.svg', padding = DOWNLOAD_PADDING): void {
	save(new Blob([figureToSvg(figure, { padding })], { type: 'image/svg+xml' }), filename);
}

/**
 * Render a chart to a PNG blob at `scale` × its on-screen size, with `padding` px around it. The page's web
 * fonts are embedded in the SVG it is drawn from, so the text looks as it does on the page.
 */
export async function figureToPng(figure: HTMLElement, scale = 2, padding = 0): Promise<Blob> {
	const fonts = await embeddedFontStyle(usedFonts(figure, isExcluded)).catch(() => '');
	const svg = figureToSvg(figure, { padding }).replace(/^(<svg[^>]*>)/, `$1${fonts ? `<defs>${fonts}</defs>` : ''}`);
	const image = new Image();
	image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
	await image.decode();
	const canvas = document.createElement('canvas');
	canvas.width = Math.ceil(image.width * scale);
	canvas.height = Math.ceil(image.height * scale);
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Canvas 2D is not available.');
	ctx.scale(scale, scale);
	ctx.drawImage(image, 0, 0);
	return new Promise((resolve, reject) =>
		canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG encoding failed.'))), 'image/png')
	);
}

/** Download a rendered chart as PNG, with `padding` px around it. */
export async function downloadPng(
	figure: HTMLElement,
	filename = 'chart.png',
	scale = 2,
	padding = DOWNLOAD_PADDING
): Promise<void> {
	save(await figureToPng(figure, scale, padding), filename);
}
/** A file name (without extension) from a chart's title: lower case, no diacritics, words joined by hyphens. */
export function fileName(title: string, fallback = 'chart'): string {
	const name = title
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^\p{L}\p{N}]+/gu, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 80)
		.replace(/-+$/, '');
	return name || fallback;
}
