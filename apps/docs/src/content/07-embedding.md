<!-- section: Publish -->

# Embedding

`pnpm build` prerenders each chart in each language to its own static page:

```
build/embed/<slug>/<locale>/index.html
build/embed/manifest.json   ← list of embeds, for mozaic export
build/embed.js              ← host-page script that resizes iframes
build/index.html            ← preview page (not for readers)
```

Pages contain the rendered SVG, so the chart shows before JavaScript loads (and without it). JavaScript then adds tooltips and interactions.

## Deploying

Upload `build/` anywhere static files can be served: GitHub Pages (the template includes a workflow), Cloudflare Pages, Netlify or S3. Links are relative, so a sub-path works. Set `baseUrl` in `mozaic.config.ts` to the public URL so the preview page shows correct embed codes.

Published embeds are snapshots: upgrading mozaic never changes a chart that is already online unless you rebuild and redeploy it.

## Embed code

Copy it from the preview page:

```html
<iframe
	src="https://charts.example.com/budget/embed/spending/ro/"
	title="Spending rose"
	data-mozaic-embed
	scrolling="no"
	loading="lazy"
	height="480"
	style="width:100%;border:0;"
></iframe>
<script src="https://charts.example.com/budget/embed.js" async></script>
```

The iframe keeps the CMS's CSS away from the chart. `embedCode({ src, title, height, scriptSrc })` from `mozaic/embed` generates the snippet.

## Resizing

The embed page posts its height to the parent page whenever it changes:

```js
{ type: 'mozaic:resize', id: '/budget/embed/spending/ro/', height: 512 }
```

`embed.js` listens for these messages and sets the height of the iframe that sent them. It is safe to include more than once. Embeds also send Datawrapper's `datawrapper-height` message, so pages that already run Datawrapper's listener resize mozaic embeds too.

If a CMS strips scripts, the iframe still works at its fixed `height`; choose one that fits the chart at mobile widths.

## Scrollytelling

Scroll stories need the page itself to scroll, so they cannot live in an auto-height iframe. Publish them as full pages (or link to them), not as embeds.

## Building your own embed page

```svelte
<script lang="ts">
	import { Embed, useEmbedParams } from 'mozaic/embed';
	const params = useEmbedParams(); // ?medium=print&width=208
</script>

<Embed>
	<MyChart style="zdg" locale="ro" medium={params.medium} width={params.width} />
</Embed>
```

`<Embed>` reports the height, removes page margins and exposes `window.__mozaic.toSvg()` for the export tool.
