---
'@samizdata/mozaic': minor
---

The `mozaic` command now ships with `@samizdata/mozaic`: `mozaic export` and `mozaic eject` work as before, and `@samizdata/mozaic-cli` is retired. Remove `@samizdata/mozaic-cli` from your project's dependencies; scripts such as `mozaic export build` keep working. `mozaic eject` lists and copies every recipe in the installed version, and `mozaic --version` prints the library's version.
