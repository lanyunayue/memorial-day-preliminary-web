# Shike v1.3.0 Deploy Plan

- Branch: `rematch-v130-agent-core`.
- Version/cache: `v1.3.0` / `shike-v130-v49`.
- Rollback tag: `shike-web-stable-before-v130-agent-core`.

1. Commit Agent modules, UI, tests, and reports.
2. Tag deployed v1.2.0 main and fast-forward without force.
3. Verify every Agent asset, version, cache, and root online.
4. Run online standard, Agent execution, and offline Edge gates in separate profiles.
5. Confirm no destructive tool bypasses its token policy.
6. Write and push the deployment report.

On any online Agent/security failure, redeploy the rollback tag and stop before v1.4.0. Agent conversations are additive IndexedDB data and do not change record schema.
