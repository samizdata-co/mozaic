import { figureToSvg } from './figure-to-svg.js';

function save(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Download a rendered chart as SVG. */
export function downloadSvg(figure: HTMLElement, filename = 'chart.svg'): void {
	save(new Blob([figureToSvg(figure)], { type: 'image/svg+xml' }), filename);
}

/** Render a chart to a PNG blob at `scale` × its on-screen size. */
export async function figureToPng(figure: HTMLElement, scale = 2): Promise<Blob> {
	const svg = figureToSvg(figure);
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

/** Download a rendered chart as PNG. */
export async function downloadPng(figure: HTMLElement, filename = 'chart.png', scale = 2): Promise<void> {
	save(await figureToPng(figure, scale), filename);
}
