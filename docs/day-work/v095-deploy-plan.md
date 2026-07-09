# Shike v0.9.5 Deploy Plan

Generated: 2026-07-10 09:55 +08:00

## Candidate

- Candidate workspace: `E:\lifetime-web-v095-sprite-assistant-2`
- Candidate branch: `rematch-v095-sprite-assistant-2`
- Product commit: `c1964c2778e50bdbfeb80e6ebc23a21e22c93faf`
- Target repository: `E:\lifetime-web`
- Baseline main: `4b6359f9c9309630691358a0d35fd485d168c839`
- Version: `v0.9.5`
- Cache: `shike-v095-v41`

## Pre-Deploy Checks

```text
node scripts\test-shike-sprite-assistant-2.js
Sprite assistant 2 regression passed: 34/34
```

```text
node scripts\test-shike-regression-suite.js
Shike clean candidate suite: 35/35 passed in 3624ms
```

```text
node scripts\test-shike-runtime-cdp.js
Runtime CDP acceptance passed: 11/11
```

## Deploy Steps

1. Confirm `E:\lifetime-web` main is clean and at `4b6359f9c9309630691358a0d35fd485d168c839`.
2. Create rollback tag:

```text
git tag shike-web-stable-before-v095-sprite-assistant-2 4b6359f9c9309630691358a0d35fd485d168c839
```

3. Push tag.
4. Fast-forward merge `rematch-v095-sprite-assistant-2` into main.
5. Rerun:

```text
node scripts\test-shike-sprite-assistant-2.js
node scripts\test-shike-regression-suite.js
node scripts\test-shike-runtime-cdp.js
```

6. Push main.
7. Verify GitHub Pages root URL:

```text
https://lanyunayue.github.io/memorial-day-preliminary-web/
```

Expected:

- `APP_VERSION='v0.9.5'`
- `CACHE_NAME='shike-v095-v41'`

8. Run online Edge CDP.
9. Generate `E:\lifetime-web\docs\day-work\v095-deploy-report.md`.

## Rollback

```text
git switch main
git reset --hard shike-web-stable-before-v095-sprite-assistant-2
git push origin main --force-with-lease
```

