# Shike v0.9.5 Deploy Report

Generated: 2026-07-10 10:02 +08:00

## 1. Release

- Version: `v0.9.5`
- Cache: `shike-v095-v41`
- Online URL: `https://lanyunayue.github.io/memorial-day-preliminary-web/`
- Main commit after deploy: `387f64862dca5ab3247119d2dbe661282625fd03`
- Product commit: `c1964c2778e50bdbfeb80e6ebc23a21e22c93faf`
- Rollback tag: `shike-web-stable-before-v095-sprite-assistant-2`

## 2. Deployment Actions

- Confirmed local main and remote main were both at v0.9.4 commit `4b6359f9c9309630691358a0d35fd485d168c839`.
- Created and pushed rollback tag `shike-web-stable-before-v095-sprite-assistant-2`.
- Fast-forward merged `rematch-v095-sprite-assistant-2` into main.
- Reran tests on main.
- Pushed main to GitHub.
- Verified GitHub Pages root URL without query params.
- Ran online Edge CDP verification.

## 3. Tests On Main Before Push

```text
node scripts\test-shike-sprite-assistant-2.js
Sprite assistant 2 regression passed: 34/34
```

```text
node scripts\test-shike-regression-suite.js
Shike clean candidate suite: 35/35 passed in 4140ms
```

```text
node scripts\test-shike-runtime-cdp.js
Runtime CDP acceptance passed: 11/11
```

## 4. Online Verification

Root URL polling:

```text
try=1 version=False cache=False
try=2 version=True cache=True
```

Confirmed online:

- `APP_VERSION='v0.9.5'`
- `CACHE_NAME='shike-v095-v41'`

Online runtime:

```text
node scripts\test-shike-runtime-cdp.js
Runtime CDP acceptance passed: 11/11
```

## 5. Notes

- `E:\lifetime` was not modified.
- `gh-pages` was not manually modified.
- Parser was not changed.
- NLP result was not claimed because this repository has no available `test-shike-nlp-parser.js`.

## 6. Rollback

```text
git switch main
git reset --hard shike-web-stable-before-v095-sprite-assistant-2
git push origin main --force-with-lease
```

## 7. Status

v0.9.5 deployed successfully. Proceeding to v0.9.6 is allowed by the version gate.

