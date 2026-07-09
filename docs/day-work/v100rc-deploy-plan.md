# Shike v1.0.0-rc Deploy Plan

Generated: 2026-07-10 03:44 +08:00

## Candidate

- Workspace: `E:\lifetime-web-v100rc-rematch-release`
- Branch: `rematch-v100rc-rematch-release`
- Product commit: `536c6c45678c702bcb04cba1018381adf6a4b4e1`
- Target repository: `E:\lifetime-web`
- Baseline main: `db1d4c8234544213a6f66078246230678cd5bc6f`
- Version: `v1.0.0-rc`
- Cache: `shike-v100rc-v45`

## Pre-Deploy Checks

```text
node scripts\test-shike-v100rc-release.js
v1.0.0-rc release regression passed: 40/40
```

```text
node scripts\test-shike-regression-suite.js
Shike clean candidate suite: 39/39 passed
```

```text
node scripts\test-shike-runtime-cdp.js
Runtime CDP acceptance passed: 11/11
```

## Deploy Steps

1. Confirm `E:\lifetime-web` main is clean and at `db1d4c8234544213a6f66078246230678cd5bc6f`.
2. Create and push rollback tag:

```text
git tag shike-web-stable-before-v100rc-rematch-release db1d4c8234544213a6f66078246230678cd5bc6f
git push origin shike-web-stable-before-v100rc-rematch-release
```

3. Fast-forward merge `rematch-v100rc-rematch-release` into main.
4. Rerun v1.0.0-rc release test, regression suite, and runtime CDP on main.
5. Push main.
6. Verify root URL:

```text
https://lanyunayue.github.io/memorial-day-preliminary-web/
```

Expected:

- `APP_VERSION='v1.0.0-rc'`
- `CACHE_NAME='shike-v100rc-v45'`

7. Run online Edge CDP.
8. Generate `E:\lifetime-web\docs\day-work\v100rc-deploy-report.md`.
9. Generate final release summary `E:\lifetime-web\docs\day-work\v100rc-final-release-summary.md`.
10. Stop. Do not continue to v1.0.1.

## Rollback

```text
git switch main
git reset --hard shike-web-stable-before-v100rc-rematch-release
git push origin main --force-with-lease
```
