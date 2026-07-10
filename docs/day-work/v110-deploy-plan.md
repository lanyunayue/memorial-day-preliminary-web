# Shike v1.1.0 Deploy Plan

## Identity

- Branch: `rematch-v110-modular-architecture`.
- Version: `v1.1.0`.
- Cache: `shike-v110-v47`.
- Rollback tag: `shike-web-stable-before-v110-modular-architecture`.

## Procedure

1. Commit the modular candidate and reports.
2. Tag the current deployed v1.0.0 main.
3. Fast-forward main without force and push main/tag.
4. Verify HTTP 200 for the root, stylesheet, classic runtime, module entry, and service worker.
5. Verify online version/cache.
6. Run online Edge CDP and online offline-start acceptance.
7. Write and push the deployment report.

## Rollback

If any online module fails to load, restore the commit referenced by the rollback tag and stop before v1.2.0. v1.1.0 does not change user data, so code rollback requires no data rollback.
