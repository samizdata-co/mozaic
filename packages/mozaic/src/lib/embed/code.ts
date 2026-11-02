function attr(value: string): string {
	return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/** The HTML snippet to paste into a CMS to embed a chart. */
export function embedCode(options: { src: string; title: string; height?: number; scriptSrc?: string }): string {
	const { src, title, height = 480, scriptSrc } = options;
	const iframe = `<iframe src="${attr(src)}" title="${attr(title)}" data-mozaic-embed scrolling="no" loading="lazy" height="${height}" style="width:100%;border:0;"></iframe>`;
	return scriptSrc ? `${iframe}\n<script src="${attr(scriptSrc)}" async></script>` : iframe;
}

/** Where a chart's embed page is, for the embed code shown under the chart (`<Chart embed>`). */
export interface ChartEmbed {
	/** The chart's embed page. A path is resolved against the page the chart is on. */
	src: string;
	/** The host-page script that resizes the iframe (`embed.js`), resolved the same way. */
	scriptSrc?: string;
	/** The iframe's title; defaults to the chart's title. */
	title?: string;
	/** The iframe's height before the script resizes it; defaults to the chart's height where it is shown. */
	height?: number;
}
