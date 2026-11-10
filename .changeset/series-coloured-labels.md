---
'@samizdata/mozaic': minor
---

Labels can take their series colour, as in Datawrapper, so they double as the legend. `LineEndLabels` has a `colorText` option, and `Label` and `Callout` take a `color`. A colour too light to read is darkened (or lightened on dark backgrounds) until it reaches 4.5:1 against the style's background. The new `readableColor(color, background)` in `@samizdata/mozaic/styles` does the same for your own marks.
