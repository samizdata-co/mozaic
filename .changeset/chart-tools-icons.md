---
'mozaic': minor
---

Icon buttons under charts. "Embed" is now an icon button that opens the embed code; `<DataTable>` becomes a "Show the data" icon button in the same row (and still works inside `<Embed>`); and a new "Download" icon button saves the chart as PNG or SVG. Turn downloads on per chart with `<Chart download>` (a string sets the file name; otherwise it comes from the title) or for every chart inside a component with `setDownloads()` from `mozaic/frame`; `download={false}` opts one out. The buttons are hidden in print and in exports; embed and download are hidden inside `<Embed>`.

Exports: images end above the controls under the chart; `figureToSvg` takes a `padding` option, and `downloadSvg` / `downloadPng` add 20 px (`DOWNLOAD_PADDING`) around the chart; PNGs embed the page's web fonts the chart uses, so their text matches the page. New locale string `downloadImage`, and `fileName()` in `mozaic/export`.
