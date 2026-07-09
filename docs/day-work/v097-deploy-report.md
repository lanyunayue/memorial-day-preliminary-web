# Shike v0.9.7 Deploy Report

Generated: 2026-07-10 11:30 +08:00

## Release

- Version: `v0.9.7`
- Service worker cache: `shike-v097-v43`
- Main commit deployed: `a2efa719581b98db04b7e623c71c20471b1d76f9`
- Rollback tag: `shike-web-stable-before-v097-record-actions-polish`
- Online URL: `https://lanyunayue.github.io/memorial-day-preliminary-web/`

## Scope

v0.9.7 shipped record card operation polish:

- Unified card actions for edit, delete, pin/unpin, copy text, single-record `.ics` export, and anniversary card export.
- Added desktop `More` action access while keeping mobile swipe actions.
- Added copy fallback and toast feedback for copy and pin actions.
- Kept existing parser, data model, feature hub, sprite assistant, calendar export, backup, and feedback flows intact.

## Tests

Main branch checks before push:

```text
node scripts\test-shike-record-actions-polish.js
Record actions polish regression passed: 35/35
```

```text
node scripts\test-shike-regression-suite.js
Shike clean candidate suite: 37/37 passed
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

Verified from the official root URL without using it as a formal versioned address:

- Root HTML contains `APP_VERSION='v0.9.7'`.
- `sw.js` contains `shike-v097-v43`.
- Online runtime CDP passed on the deployed site.

## Deployment Notes

- `main` was pushed.
- Rollback tag was pushed.
- `gh-pages` was not manually edited.
- `E:\lifetime` was not modified.
- No rollback was needed.

## Next Gate

Proceed to v0.9.8 release feedback center from deployed main `a2efa719581b98db04b7e623c71c20471b1d76f9`.
