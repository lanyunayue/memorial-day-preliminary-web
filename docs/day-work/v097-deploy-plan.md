# Shike v0.9.7 Deploy Plan

Generated: 2026-07-10 11:05 +08:00

## Candidate

- Workspace: `E:\lifetime-web-v097-record-actions-polish`
- Branch: `rematch-v097-record-actions-polish`
- Product commit: `b174181ec91e15d08086f33f9d09832913a3a3c9`
- Target repository: `E:\lifetime-web`
- Baseline main: `d8c94d7c232ce1e806165211fc8d11e76c34a849`
- Version: `v0.9.7`
- Cache: `shike-v097-v43`

## Pre-Deploy Checks

```text
node scripts\test-shike-record-actions-polish.js
Record actions polish regression passed: 35/35
```

```text
node scripts\test-shike-regression-suite.js
Shike clean candidate suite: 37/37 passed in 3866ms
```

```text
node scripts\test-shike-runtime-cdp.js
Runtime CDP acceptance passed: 11/11
```

## Deploy Steps

1. Confirm `E:\lifetime-web` main is clean and at `d8c94d7c232ce1e806165211fc8d11e76c34a849`.
2. Create and push rollback tag:

```text
git tag shike-web-stable-before-v097-record-actions-polish d8c94d7c232ce1e806165211fc8d11e76c34a849
git push origin shike-web-stable-before-v097-record-actions-polish
```

3. Fast-forward merge `rematch-v097-record-actions-polish` into main.
4. Rerun record actions, regression suite, and runtime CDP on main.
5. Push main.
6. Verify root URL:

```text
https://lanyunayue.github.io/memorial-day-preliminary-web/
```

Expected:

- `APP_VERSION='v0.9.7'`
- `CACHE_NAME='shike-v097-v43'`

7. Run online Edge CDP.
8. Generate `E:\lifetime-web\docs\day-work\v097-deploy-report.md`.

## Rollback

```text
git switch main
git reset --hard shike-web-stable-before-v097-record-actions-polish
git push origin main --force-with-lease
```

