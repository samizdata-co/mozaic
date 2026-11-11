---
'@samizdata/mozaic': minor
---

Labels that fit the chart:

- `AxisX`: on a continuous scale, tick labels that would overlap are thinned to every other tick (or every third, and so on), measured in the axis font; the tick marks stay.
- `LineEndLabels`: a label too long for the room right of the plot breaks onto two or more lines instead of running off the chart, and its neighbours make room for it.
- `avoidOverlap` takes optional `sizes` (each label's height in multiples of the gap), and `wrapLabel(text, maxWidth, measure)` (in `transforms`) breaks a label into lines.
- `@samizdata/mozaic/cli` exports the CLI's building blocks, with types: `launchBrowser`, `findBrowser`, `browserCandidates` and `serveStatic`, for scripts that render charts their own way.
- `LineEndLabels`: `dot={false}` leaves out the dot on the last point, for lines whose last point has a mark of its own (an election result's circle, say).
