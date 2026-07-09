# Shike v0.9.8 Deploy Report

Generated: 2026-07-10 03:40 +08:00

## Release

- Version: `v0.9.8`
- Service worker cache: `shike-v098-v44`
- Main commit deployed: `d538ce8dfa182555c80f969cb1b3087b02bbae7d`
- Product commit: `5c55be9817fd44d4d59e7562107b190548497081`
- Rollback tag: `shike-web-stable-before-v098-release-feedback-center`
- Online URL: `https://lanyunayue.github.io/memorial-day-preliminary-web/`

## Scope

v0.9.8 shipped the release and feedback trust layer:

- Update history center with recent versions from `v0.9.8` to `v0.9.3`.
- Feature hub update entry now opens the update center and can show the current release note.
- Feedback section includes email, mailto, copy email, and copy feedback template.
- Feedback copy states that no backend form is connected and local data is not uploaded.
- Future plans are shown as a lightweight planning list without claiming launched cloud, background, stock, or model-agent abilities.

## Tests

Main branch checks before push:

```text
node scripts\test-shike-release-feedback-center.js
Release feedback center regression passed: 17/17
```

```text
node scripts\test-shike-regression-suite.js
Shike clean candidate suite: 38/38 passed
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

- Root HTML contains `APP_VERSION='v0.9.8'`.
- `sw.js` contains `shike-v098-v44`.
- Online runtime CDP passed on the deployed site.

## Deployment Notes

- `main` was pushed.
- Rollback tag was pushed.
- `gh-pages` was not manually edited.
- `E:\lifetime` was not modified.
- No rollback was needed.

## Next Gate

Proceed to v1.0.0-rc release candidate from deployed main `d538ce8dfa182555c80f969cb1b3087b02bbae7d`.
