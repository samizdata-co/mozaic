---
'mozaic': patch
---

`Tooltip` stays inside the chart: once measured, it changes side when there is no room on the usual one and slides over when neither side fits, so a wide tooltip on a narrow chart no longer runs off the left or right edge. The placement is `tooltipLeft` in `interactive/tooltip-position.ts`.
