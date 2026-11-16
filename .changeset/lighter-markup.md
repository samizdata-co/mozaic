---
'@samizdata/mozaic': minor
---

`Line`, `Area` and `Sparkline` write their paths to a tenth of a pixel (d3's default is a thousandth), and `Points` writes its dot centres to a hundredth. Nobody can see the difference, on screen or in print, and the gzipped HTML of a page of long-running poll charts is a fifth to a quarter smaller.

`setLoadFonts(false)` (from `@samizdata/mozaic/frame`, like `setDownloads()`): the charts inside it no longer add their style's font stylesheet to the page head, for a site that loads or inlines the fonts itself. It leaves one render-blocking stylesheet fewer and no copy of the `<link>` per chart. A chart's own `loadFonts` still wins.
