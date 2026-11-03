---
'@samizdata/mozaic': minor
'@samizdata/mozaic-cli': patch
'@samizdata/create-mozaic': patch
---

Chart details from the Prețuri gaz charts:

- `AxisY` takes a `unit`, written once after the top tick label ("50 lei/m³"); on a left axis it runs into the plot, so it needs no extra padding.
- `Tooltip` takes a `title` and `items` (label, value, colour, line or square swatch): one row per series, values aligned in a column.
- `RefLine` labels can span several lines (`\n`); vertical lines take `anchor` (label right or left of the line), `labelY` (a negative value puts the label above the plot, with the line running up to it) and `dotted`.
- `Waffle` takes `origin="bottom"` to fill from the bottom row up, so waffles of different totals share a baseline.
- `mozaic export`: PNGs no longer include the icon buttons under the chart or a tooltip.
- The project template's example chart uses the tooltip items and no longer adds a data table; its AGENTS.md says to add one only when asked.
