---
'mozaic': minor
---

Embed codes under charts: `<Chart embed={{ src, scriptSrc }}>` (and the same `embed` prop on every recipe) adds an "Embed" control under the chart that opens its iframe code with a copy button. Paths are resolved against the page; the iframe title and height default to the chart's. The control is hidden in print, in SVG and PNG exports and inside `<Embed>`. New locale strings `embed`, `embedCode`, `copy` and `copied`, and a `ChartEmbed` type from `mozaic/embed`.
