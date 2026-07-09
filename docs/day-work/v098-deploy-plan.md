# Shike v0.9.8 Deploy Plan

Generated: 2026-07-10 03:29 +08:00

## Candidate

- Workspace: `E:\lifetime-web-v098-release-feedback-center`
- Branch: `rematch-v098-release-feedback-center`
- Product commit: `5c55be9817fd44d4d59e7562107b190548497081`
- Target repository: `E:\lifetime-web`
- Baseline main: `a65f5d77ead4f0ca62fb010f9dc428e334bea45c`
- Version: `v0.9.8`
- Cache: `shike-v098-v44`

## Pre-Deploy Checks

```text
node scripts\test-shike-release-feedback-center.js
Release feedback center regression passed: 17/17
```

```text
node scripts\test-shike-regression-suite.js
Shike clean candidate suite: 38/38 passed
```

```text
node scripts\test-shike-runtime-cdp.js
Runtime CDP acceptance passed: 11/11
```

## Deploy Steps

1. Confirm `E:\lifetime-web` main is clean and at `a65f5d77ead4f0ca62fb010f9dc428e334bea45c`.
2. Create and push rollback tag:

```text
git tag shike-web-stable-before-v098-release-feedback-center a65f5d77ead4f0ca62fb010f9dc428e334bea45c
git push origin shike-web-stable-before-v098-release-feedback-center
```

3. Fast-forward merge `rematch-v098-release-feedback-center` into main.
4. Rerun release feedback center, regression suite, and runtime CDP on main.
5. Push main.
6. Verify root URL:

```text
https://lanyunayue.github.io/memorial-day-preliminary-web/
```

Expected:

- `APP_VERSION='v0.9.8'`
- `CACHE_NAME='shike-v098-v44'`

7. Run online Edge CDP.
8. Generate `E:\lifetime-web\docs\day-work\v098-deploy-report.md`.

## Rollback

```text
git switch main
git reset --hard shike-web-stable-before-v098-release-feedback-center
git push origin main --force-with-lease
```
