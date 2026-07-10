# Shike v1.2.0 Deploy Plan

## Identity

- Branch: `rematch-v120-local-first-data`.
- Version: `v1.2.0`.
- Cache: `shike-v120-v48`.
- Rollback tag: `shike-web-stable-before-v120-local-first-data`.

## Procedure

1. Commit candidate, tests, schema, migration, recovery, runtime, and deployment plan.
2. Tag deployed v1.1.0 main.
3. Fast-forward and push main/tag without force.
4. Verify root, all new storage modules, version, and service worker online.
5. Run online standard Edge, isolated old-user migration Edge, and offline restart.
6. Confirm localStorage source/snapshot remain present after migration.
7. Write and push the deployment report.

## Rollback

If migration or runtime verification fails, redeploy the rollback tag and stop before v1.3.0. The v1.1.0 code can read the retained `shike_records_v1`; no database deletion is required or permitted.
