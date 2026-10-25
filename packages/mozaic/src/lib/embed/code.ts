function attr(value: string): string {
	return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/** The HTML snippet to paste into a CMS to embed a chart. */
export function embedCode(options: { src: string; title: string; height?: number; scriptSrc?: string }): string {
	const { src, title, height = 480, scriptSrc } = options;
	const iframe = `<iframe src="${attr(src)}" title="${attr(title)}" data-mozaic-embed scrolling="no" loading="lazy" height="${height}" style="width:100%;border:0;"></iframe>`;
	return scriptSrc ? `${iframe}\n<script src="${attr(scriptSrc)}" async></script>` : iframe;
}
