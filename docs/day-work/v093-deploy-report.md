# Shike v0.9.3 Deploy Report

Generated: 2026-07-09 22:46 +08:00

## 1. Release

- Version: `v0.9.3`
- Cache: `shike-v093-v39`
- Online URL: `https://lanyunayue.github.io/memorial-day-preliminary-web/`
- Main commit after product deploy: `62352af9a1bc45896b8269984af541639cc033ce`
- Product candidate commit: `46d613d859f714b9aa2adccaeff9e6cc4054d7b0`
- Candidate report commit: `62352af9a1bc45896b8269984af541639cc033ce`
- Rollback tag: `shike-web-stable-before-v093-product-polish`

## 2. Deployment Actions

- Confirmed `E:\lifetime-web` main was clean at `406a88d3c425d7137e55e546da7e5642f892e318`.
- Confirmed `origin/main` matched local main before merge.
- Created rollback tag `shike-web-stable-before-v093-product-polish` at `406a88d3c425d7137e55e546da7e5642f892e318`.
- Fast-forward merged `rematch-v093-product-polish` into main.
- Reran regression checks on main before push.
- Pushed rollback tag to GitHub.
- Pushed main to GitHub.
- Verified GitHub Pages root URL without query params.

## 3. Tests Before Push

Static regression on main:

```text
node scripts\test-shike-regression-suite.js
Shike clean candidate suite: 33/33 passed in 4701ms
```

Local Edge CDP on main:

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

Online expected values confirmed:

- `APP_VERSION='v0.9.3'`
- `CACHE_NAME='shike-v093-v39'`

Online Edge CDP:

```text
node scripts\test-shike-runtime-cdp.js
Runtime CDP acceptance passed: 11/11
```

## 5. Scope

This release contains:

- Home simplification.
- `体验示例` moved to `我的`.
- Swipe card actions for edit, delete, and pin.
- Version-scoped release notes modal.
- Feedback email entry.
- Lightweight 2D companion visual and quick-action upgrade.
- Restrained future-plan section.
- Static and runtime regression coverage for the above.

This release does not contain:

- LLM/API/Agent/network integration.
- Parser rewrite.
- Accounts, cloud database, stock API, or calendar auto-sync.
- Large theme or layout rewrite.
- Changes to `E:\lifetime`.

## 6. Rollback

If rollback is required:

```text
git switch main
git reset --hard shike-web-stable-before-v093-product-polish
git push origin main --force-with-lease
```

## 7. Status

- GitHub Pages updated: yes.
- Online root verified: yes.
- Product code after deploy report: unchanged.
- New release work after v0.9.3: stopped.

