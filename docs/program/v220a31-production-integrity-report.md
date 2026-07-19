# Shike v2.2.0-alpha3.1 Production Integrity Report

## Release Identity

- Version: `v2.2.0-alpha3.1`
- Initial broken `main`: `365a5d1a5852cb1c7e63849ab2d5e609579557c3`
- Recovery commit: `24fbb3b222757871ed83d0c1d3eb3f283ca1342f`
- Product integrity commit: `0c9b518735c706c121222e2cef2fcadb40bcfc0d`
- CI gate alignment commit: `b4f52f4ba5ec57badd4e513d52df2143a6de2bd7`
- Service Worker cache: `shike-v220alpha31-v64`
- Production URL: `https://lanyunayue.github.io/memorial-day-preliminary-web/`
- Rollback tag: `rollback-before-v220-alpha3-1-production-recovery`

## Root Cause and Repair

The former production branch contained unresolved merge markers in 26 files. GitHub Pages successfully published invalid source because the then-current CI did not prevent that source state. The recovery restored the clean v2.2.0-alpha3 product tree, removed obsolete Watch Center integration, then added production integrity fixes without redesigning UI, changing the parser, or expanding product scope.

The release also closes two product-truth defects. Composer success now waits for durable IndexedDB persistence and rolls back on write failure. Duplicate protection uses the submitted text, so a double-click is deduplicated while a different next draft remains immediately available.

## Local Quality Evidence

| Gate | Result |
| --- | --- |
| Lint | Passed |
| Format | Passed |
| Unit | `27/27` |
| Legacy aggregate | `66/66` |
| NLP create-intent corpus | `102/102` |
| Static accessibility | `6/6` |
| Security | Passed |
| CI gate regression | `5/5` |
| Test integrity | `690/690`, skipped `0` |
| PWA metadata/assets | `9/9` |
| Playwright real browser | `5/5` |
| CDP aggregate | `7/7` |
| CDP experience | `30/30` |
| CDP responsive | `12/12` |
| Dependency audit | `0` vulnerabilities after clean lockfile install |

The CDP runner exits non-zero on any failed group. Playwright and CDP are separate mandatory layers; neither silently substitutes for the other.

## Remote and Production Evidence

- GitHub CI run `29673436595`: success.
- GitHub Pages run `29673436241`: success.
- Production root: HTTP 200.
- Production release identity: `v2.2.0-alpha3.1`.
- Conflict markers: `0`.
- `@vite/client`: absent.
- Description, Open Graph, canonical, and apple-touch-icon: present.
- Pure online Edge loads: `3/3`, no console/page errors and no HTTP responses >= 400.
- Production capture: two distinct consecutive records produced memory `2`, IndexedDB `2`, and remained `2` after reload.
- Double-click duplicate protection: passed.
- Search and calendar-dot linkage: passed.
- Legacy localStorage to current local-first model migration: passed in a fresh production browser context.
- Production viewport matrix: `14/14` at 320, 360, 375, 390, 412, 430, 768, 820, 1024, 1280, 1366, 1440, 1920, and 2560 pixels wide.
- Installed cache: only `shike-v220alpha31-v64` in the fresh context.
- Cached index and clipboard utility: present.
- Offline root reload: passed.

## Release Risk

There are no open P0 or P1 findings in the current register. Google Fonts remains an optional external request. The app has a functional system-font fallback, passes the responsive matrix offline, and does not depend on font delivery for product behavior. Universal network availability is recorded as an accepted P2 risk rather than represented as proven.

## Deployment and Rollback

This release used a normal fast-forward push. No force push, branch rewrite, mobile source edit, Android build, or HarmonyOS build occurred. To roll back, create a normal revert/recovery commit from the rollback tag and allow the same CI and Pages gates to publish it.

## Decision

Web production is `GO` for the current alpha channel. The next work must maintain the same truth gates and must not treat the independent official site, future Android port, or future HarmonyOS port as implemented until each has its own verified release evidence.
