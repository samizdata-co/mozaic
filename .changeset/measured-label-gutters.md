---
'@samizdata/mozaic': minor
---

- `BarChart`, `StackedBarChart`, `BarDotChart`, `ArrowChart`, `MosaicChart`: the gutter for row labels fits the labels as rendered. It was estimated from the number of characters, which left a wide empty margin in narrow fonts such as Source Sans (about 30 px for a 16-character label at 12 px). The estimate still sets the server-rendered layout; the width is measured once the chart mounts and again when web fonts load.
- `AxisY`: a `\n` in a tick label breaks it into lines, centred on the tick (`'2026\n(Jan–Aug)'`). The recipes size their gutter by the widest line.
- New in `core`: `useTextWidth()` for layouts that depend on text width, and `measureTextWidth(text, font)`.
