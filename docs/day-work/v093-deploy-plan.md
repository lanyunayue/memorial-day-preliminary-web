# Shike v0.9.3 Deploy Plan

Generated: 2026-07-09 22:38 +08:00

## Candidate

- Candidate workspace: `E:\lifetime-web-v093-product-polish`
- Candidate branch: `rematch-v093-product-polish`
- Candidate commit: `46d613d859f714b9aa2adccaeff9e6cc4054d7b0`
- Target main repository: `E:\lifetime-web`
- Current main baseline: `406a88d3c425d7137e55e546da7e5642f892e318`
- Version: `v0.9.3`
- Cache: `shike-v093-v39`

## Pre-Deploy Checks Already Passed

```text
node scripts\test-shike-regression-suite.js
Shike clean candidate suite: 33/33 passed in 4194ms
```

```text
node scripts\test-shike-runtime-cdp.js
Runtime CDP acceptance passed: 11/11
```

## Deploy Steps

1. Confirm `E:\lifetime-web` main is clean and still at `406a88d3c425d7137e55e546da7e5642f892e318`.
2. Create stable rollback tag:

```text
git tag shike-web-stable-before-v093-product-polish 406a88d3c425d7137e55e546da7e5642f892e318
```

3. Fast-forward merge the candidate:

```text
git switch main
git merge --ff-only rematch-v093-product-polish
```

4. Rerun on main:

```text
node scripts\test-shike-regression-suite.js
node scripts\test-shike-runtime-cdp.js
```

5. Push tag and main:

```text
git push origin shike-web-stable-before-v093-product-polish
git push origin main
```

6. Verify GitHub Pages root URL, without query params:

```text
https://lanyunayue.github.io/memorial-day-preliminary-web/
```

Expected online values:

- `APP_VERSION='v0.9.3'`
- `CACHE_NAME='shike-v093-v39'`

7. Run online runtime CDP against the root URL.

## Rollback

```text
git switch main
git reset --hard shike-web-stable-before-v093-product-polish
git push origin main --force-with-lease
```

## Notes

- Do not modify `E:\lifetime`.
- Do not start a new feature version after this deploy.
- If tag push fails due transient network/SSL errors, retry before pushing main when possible and record the outcome in the deploy report.

