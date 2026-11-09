---
'@samizdata/mozaic': patch
---

`Tooltip`: the card keeps its width as it moves. It used to shrink to the room left of its position, which moved it again and set off "ResizeObserver loop" errors when hovering near the right side of narrow charts.
