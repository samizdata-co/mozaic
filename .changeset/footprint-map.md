---
'@samizdata/mozaic': minor
---

`FootprintMap` recipe: the areas several events reached (the zones each earthquake shook hard, each flood covered) overlaid on one map, oldest faintest and newest strongest, labelled on the map or in a key at narrow widths, with a tooltip listing the areas under the pointer. `contourPoints` transform: filled contours of scattered measurements on a map (Gaussian-weighted mean on a grid, fading out where the data stops), as GeoJSON for `GeoPath` or `FootprintMap`. Adds `d3-contour` as a dependency.
