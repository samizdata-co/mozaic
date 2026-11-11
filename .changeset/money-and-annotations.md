---
'@samizdata/mozaic': minor
---

Number formats: `createLocale(…).money` (two decimals, none for whole amounts: 26.14, 12.30, 26) and `decimals(n)` (n decimals, none when the value rounds to a whole number, so no "11.0" or "26.00").

Recipes: tooltips can show units (`BarChart` and `StripChart` `unit`, `ScatterChart` `xUnit`/`yUnit`, whose tooltip now uses the `title`/`items` card). `StripChart`: `directions` (arrows under the axis, e.g. "← Cheaper", "Dearer →"), very soft gridlines (`grid`, on by default) and `axisLabel` for an axis title; `unit` now goes in the tooltip instead of on the axis. `ScatterChart`: `quadrants` (dashed dividing lines at two reference values and a label in each quarter's corner, wrapped to fit), `directions` (axis arrows, shown instead of the quarter labels when those don't fit), and `xDomain`/`yDomain`. With directions, the low end is dropped when both ends don't fit; leave an end empty for one arrow.

`Tooltip`: no swatch column when no row has a colour, so the rows are no longer indented by an empty square. `StripChart` and `ScatterChart`: `emphasize` sets chosen labels in bold (`StripChart` labels are now regular unless emphasized).

`AxisX`: new `unit`, written after the last labelled tick ("50.000 euro") and kept inside the chart, like `AxisY`'s after the top tick. Every recipe with a value axis now puts its unit there: `StripChart` (`unit`), `ScatterChart` (`xUnit`, `yUnit`), and a new `unit` on `ColumnChart`, `LineChart`, `ArrowChart` and `BarDotChart`, which also goes after the tooltip values.

`BarChart`: value labels go inside the end of each bar where they fit (white on dark bars, the text colour on light ones) and after it otherwise (`labelsInside`, on by default). The bars now run to the largest value instead of a rounded-up maximum, and right-hand room is kept only for labels that stay outside, so there is no empty space on the right.
