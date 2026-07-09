# Shike v0.9.6 Deploy Report

Generated: 2026-07-10 10:32 +08:00

## 1. Release

- Version: `v0.9.6`
- Cache: `shike-v096-v42`
- Online URL: `https://lanyunayue.github.io/memorial-day-preliminary-web/`
- Main commit after deploy: `70af39180959b813386d1fe36235edc40e061c99`
- Product commit: `64d8bc906e1bd5d343701a891fe522e7047de823`
- Rollback tag: `shike-web-stable-before-v096-feature-hub-cleanup`

## 2. Deployment Actions

- Confirmed local main and remote main were both `f8e103292b2d73e085071b640b05b10dd0033619`.
- Created and pushed rollback tag `shike-web-stable-before-v096-feature-hub-cleanup`.
- Fast-forward merged `rematch-v096-feature-hub-cleanup` into main.
- Reran tests on main.
- Pushed main to GitHub.
- Verified GitHub Pages root URL.
- Ran online Edge CDP verification.

## 3. Tests On Main Before Push

```text
node scripts\test-shike-feature-hub-cleanup.js
Feature hub cleanup regression passed: 22/22
```

```text
node scripts\test-shike-regression-suite.js
Shike clean candidate suite: 36/36 passed in 3748ms
```

```text
node scripts\test-shike-runtime-cdp.js
Runtime CDP acceptance passed: 11/11
```

## 4. Online Verification

```text
try=1 version=False cache=False
try=2 version=True cache=True
```

Confirmed online:

- `APP_VERSION='v0.9.6'`
- `CACHE_NAME='shike-v096-v42'`

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
git reset --hard shike-web-stable-before-v096-feature-hub-cleanup
git push origin main --force-with-lease
```

## 7. Status

v0.9.6 deployed successfully. Proceeding to v0.9.7 is allowed by the version gate.

