# Shike Web Master Bug Register

## Scope

- Product: Shike Web/PWA
- Audited release: `v2.2.0-alpha3.1`
- Production URL: `https://lanyunayue.github.io/memorial-day-preliminary-web/`
- Verified `main`: `b4f52f4ba5ec57badd4e513d52df2143a6de2bd7`
- Product recovery commit: `0c9b518735c706c121222e2cef2fcadb40bcfc0d`
- Rollback tag: `rollback-before-v220-alpha3-1-production-recovery`

The CSV beside this document is the field-level source of truth. This summary does not convert old reports or isolated prototypes into current findings.

## Current Gate

| Severity | Discovered | Fixed or closed | Accepted | Open blocker |
| --- | ---: | ---: | ---: | ---: |
| P0 | 1 | 1 | 0 | 0 |
| P1 | 9 | 9 | 0 | 0 |
| P2 | 6 | 5 | 1 | 0 |

`TRAE-P2-012` is the only accepted residual risk. Google Fonts is optional, asynchronous, and has a tested system-font fallback, but universal mainland-China availability has not been proven. It is not a release blocker for this alpha.

## Important Outcomes

1. The previously deployed conflicted source is replaced by a clean tree.
2. A hidden execution area no longer appears due to CSS display overrides.
3. A successful capture now means IndexedDB persistence completed; failures roll back in-memory state.
4. Double-clicking cannot create duplicate records, while a different next draft remains actionable.
5. Static, unit, browser, PWA, offline, migration, multi-tab, accessibility, security, format, and lint gates are hard failures.
6. Web production has no remaining P0 or P1 finding in this register.

## TRAE Evidence Boundary

The expected TRAE handoff directory was unavailable during this audit. Its listed findings were therefore treated as candidate observations only. Each classification in the CSV is based on the current Git tree, current production HTML, direct HTTP checks, or real Edge/Chromium execution.

## Product Scope Decisions

- `CORE`: capture, reminders, promises, Waiting For, calendar, search, local-first storage, undo, recovery review.
- `SUPPORTING`: backup/import, accessibility settings, permissions, PWA installation, optional weather context.
- `OPTIONAL`: themes, export card, public knowledge retrieval.
- `EXPERIMENTAL`: WebGL/3D and voice surfaces, only when hidden or non-blocking.
- `REMOVE/HIDE_BY_DEFAULT`: Watch Center, RSS surfaces, unsupported agent tools, and any unverified download entry.

## Rollback

If production integrity regresses, republish the tree referenced by `rollback-before-v220-alpha3-1-production-recovery` through a normal reviewed commit. Do not force-push or rewrite `main`.
