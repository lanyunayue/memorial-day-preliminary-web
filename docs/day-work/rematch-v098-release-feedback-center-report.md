# Shike v0.9.8 Release Feedback Center Report

Generated: 2026-07-10 03:29 +08:00

## 1. Candidate

- Workspace: `E:\lifetime-web-v098-release-feedback-center`
- Branch: `rematch-v098-release-feedback-center`
- Baseline main: `a65f5d77ead4f0ca62fb010f9dc428e334bea45c`
- Product commit: `5c55be9817fd44d4d59e7562107b190548497081`
- Version: `v0.9.8`
- Service worker cache: `shike-v098-v44`

## 2. Scope

Implemented a visible release and feedback trust layer without changing parser or core record behavior.

Changed product files:

- `index.html`
- `sw.js`

Changed or added tests:

- `scripts/test-shike-release-feedback-center.js`
- Version/cache assertions in existing static and runtime tests
- `scripts/test-shike-regression-suite.js`

## 3. Product Changes

- Added `releaseCenterSection` on My page with a collapsible update history.
- Listed recent versions: `v0.9.8`, `v0.9.7`, `v0.9.6`, `v0.9.5`, `v0.9.4`, `v0.9.3`.
- Connected the feature hub update entry to the visible update center and retained the release note modal for "View this update".
- Enhanced feedback with:
  - email `308138249@qq.com`
  - mailto link
  - copy email
  - copy feedback template
  - no-backend and no-upload wording
- Expanded future plans into a light five-item roadmap using planning language only.

## 4. Guardrails

- No parser changes.
- No account, database, cloud sync, API key, or backend form.
- No manual `gh-pages` edit.
- No stock monitoring, trading, cloud sync, background reminder, or model-agent claims.
- `E:\lifetime` was not modified.

## 5. Tests

New v0.9.8 test:

```text
node scripts\test-shike-release-feedback-center.js
Release feedback center regression passed: 17/17
```

Regression suite:

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
Runtime CDP acceptance passed: 11/11
```

NLP note: 本轮未改 parser；当前仓库未发现可用 `test-shike-nlp-parser.js`，未声明 NLP 数字结果。

## 6. Runtime Coverage

- Viewports: 375, 390, 414, 768, 1024, 1366, 1440
- Pages: Home, All, Calendar, Import, My
- Checks: no white screen, no horizontal overflow, bottom nav visible, sprite not blocking controls, feedback visible, update center visible, export/backup controls visible, and no app-level JS errors.

## 7. Rollback

Deploy rollback tag:

```text
shike-web-stable-before-v098-release-feedback-center
```

Rollback command:

```text
git switch main
git reset --hard shike-web-stable-before-v098-release-feedback-center
git push origin main --force-with-lease
```

## 8. Deploy Recommendation

Ready to deploy v0.9.8 if main is still at `a65f5d77ead4f0ca62fb010f9dc428e334bea45c` and key checks pass again on main after merge.
