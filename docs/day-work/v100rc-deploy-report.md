# Shike v1.0.0-rc Deploy Report

Generated: 2026-07-10 03:58 +08:00

## Release

- Version: `v1.0.0-rc`
- Service worker cache: `shike-v100rc-v45`
- Main commit deployed: `b908049d9750ba6f8daa8882fb2b05009350541e`
- Product commit: `536c6c45678c702bcb04cba1018381adf6a4b4e1`
- Rollback tag: `shike-web-stable-before-v100rc-rematch-release`
- Online URL: `https://lanyunayue.github.io/memorial-day-preliminary-web/`

## Scope

v1.0.0-rc shipped final release-candidate polish:

- Product positioning statement.
- Product capability checklist.
- `v1.0.0-rc` update-center entry.
- Release candidate notes.
- Copy audit to avoid claims about unlaunched abilities.

## Tests

Main branch checks before push:

```text
node scripts\test-shike-v100rc-release.js
v1.0.0-rc release regression passed: 40/40
```

```text
node scripts\test-shike-regression-suite.js
Shike clean candidate suite: 39/39 passed
```

Existing script sweep:

```text
failed=0
missing=2
missing scripts:
- scripts/test-shike-existing-dedupe.js
- scripts/test-shike-batch-capture.js
```

Runtime CDP:

```text
local Edge CDP: Runtime CDP acceptance passed: 11/11
online Edge CDP: Runtime CDP acceptance passed: 11/11
```

NLP note: 本轮未改 parser；当前仓库未发现可用 `test-shike-nlp-parser.js`，未声明 NLP 数字结果。

## Online Verification

Verified from the official root URL:

- Root HTML contains `APP_VERSION='v1.0.0-rc'`.
- `sw.js` contains `shike-v100rc-v45`.
- Online runtime CDP passed on the deployed site.

## Deployment Notes

- `main` was pushed.
- Rollback tag was pushed.
- `gh-pages` was not manually edited.
- `E:\lifetime` was not modified.
- No rollback was needed.
- Automatic feature development stops here; no v1.0.1 work was started.
