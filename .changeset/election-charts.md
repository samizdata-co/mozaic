---
'mozaic': minor
'create-mozaic': minor
---

Election charts: a `Hemicycle` mark (parliament chart with a majority line and a centre snippet), an `Intervals` mark (ranges with a point estimate, horizontal or vertical), and transforms `hemicycleLayout`, `kernelSmooth` (kernel-weighted average with optional weights and standard errors) and `loess`. New house style `plebiscit` (IBM Plex, neutral ink chrome so party colours carry the meaning). Gallery examples: poll tracker and parliament.

Fix: before a plot is measured (server render, no JavaScript yet), `<Html>` layers are sized in percentages, so responsive charts no longer make the page scroll sideways on phones until hydration.
