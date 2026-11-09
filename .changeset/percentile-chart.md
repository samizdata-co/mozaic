---
'@samizdata/mozaic': minor
---

A `PercentileChart` recipe for "how do you compare?" interactives: one strip per group with its published percentiles (range, middle half, median), a "you" line at the reader's value, set with a number box, a slider or by clicking or dragging on the strips, and the reader's estimated percentile in each group at the right, with an optional sentence for the highlighted group. In print the controls are hidden and the chart shows the starting value. `percentileRank` (in `transforms`) does the interpolation and can be used on its own. `mozaic eject PercentileChart` copies the recipe into a project.
