# Shike v0.9.6 Deploy Plan

Generated: 2026-07-10 10:25 +08:00

## Candidate

- Workspace: `E:\lifetime-web-v096-feature-hub-cleanup`
- Branch: `rematch-v096-feature-hub-cleanup`
- Product commit: `64d8bc906e1bd5d343701a891fe522e7047de823`
- Target repository: `E:\lifetime-web`
- Baseline main: `f8e103292b2d73e085071b640b05b10dd0033619`
- Version: `v0.9.6`
- Cache: `shike-v096-v42`

## Pre-Deploy Checks

```text
node scripts\test-shike-feature-hub-cleanup.js
Feature hub cleanup regression passed: 22/22
```

```text
node scripts\test-shike-regression-suite.js
Shike clean candidate suite: 36/36 passed in 3888ms
```

```text
node scripts\test-shike-runtime-cdp.js
Runtime CDP acceptance passed: 11/11
```

## Deploy Steps

1. Confirm `E:\lifetime-web` main is clean and at `f8e103292b2d73e085071b640b05b10dd0033619`.
2. Create and push rollback tag:

```text
git tag shike-web-stable-before-v096-feature-hub-cleanup f8e103292b2d73e085071b640b05b10dd0033619
git push origin shike-web-stable-before-v096-feature-hub-cleanup
```

3. Fast-forward merge `rematch-v096-feature-hub-cleanup` into main.
4. Rerun feature hub, regression suite, and runtime CDP on main.
5. Push main.
6. Verify root URL:

```text
https://lanyunayue.github.io/memorial-day-preliminary-web/
```

Expected:

- `APP_VERSION='v0.9.6'`
- `CACHE_NAME='shike-v096-v42'`

7. Run online Edge CDP.
8. Generate `E:\lifetime-web\docs\day-work\v096-deploy-report.md`.

## Rollback

```text
git switch main
git reset --hard shike-web-stable-before-v096-feature-hub-cleanup
git push origin main --force-with-lease
```

