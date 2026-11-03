---
'mozaic': minor
'create-mozaic': minor
---

House styles move out of the library. `mozaic/styles` no longer exports `samizdata`, `zdg`, `plebiscit`, `styles`, `StyleName` or `resolveStyle`: pass a `Theme` object to `<Chart style>` and the recipes (`base` by default). The SAMIZDATA and Ziarul de Gardă themes are now in their brand repositories (`datavis/mozaic/`), and Plebiscit.md keeps its own. New `checkTheme(theme)` lists problems with a style (missing tokens, short palettes, unreadable text). `create-mozaic` drops `--style`: projects get a `src/lib/theme.ts` that starts from `base`.
