---
'@samizdata/mozaic': patch
---

`ScatterChart`, `BarChart` and `ColumnChart` keep the hovered point or bar at full strength again: the hovered row was stored in a deep `$state` proxy, so it never matched its datum and every mark faded, the hovered one too.
