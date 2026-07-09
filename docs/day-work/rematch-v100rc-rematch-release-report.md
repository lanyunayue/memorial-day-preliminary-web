# Shike v1.0.0-rc Rematch Release Report

Generated: 2026-07-10 03:44 +08:00

## 1. Candidate

- Workspace: `E:\lifetime-web-v100rc-rematch-release`
- Branch: `rematch-v100rc-rematch-release`
- Baseline main: `db1d4c8234544213a6f66078246230678cd5bc6f`
- Product commit: `536c6c45678c702bcb04cba1018381adf6a4b4e1`
- Version: `v1.0.0-rc`
- Service worker cache: `shike-v100rc-v45`

## 2. Scope

Final release-candidate polish for the rematch demo. This version intentionally avoids large new features and focuses on product clarity, capability summary, and copy discipline.

Changed product files:

- `index.html`
- `sw.js`

Changed or added tests:

- `scripts/test-shike-v100rc-release.js`
- `scripts/test-shike-pwa-assets.js`
- `scripts/test-shike-release-feedback-center.js`
- Version/cache assertions in existing tests
- `scripts/test-shike-regression-suite.js`

## 3. Product Changes

- Added product positioning:
  - Shike is not a calendar replacement.
  - It turns one sentence from chat, notifications, or memory into time-aware local records, then connects export, backup, and reminder notes.
- Added `产品能力清单`:
  - one-sentence input
  - local save
  - JSON backup
  - `.ics` export
  - batch organize
  - dedupe protection
  - bear assistant
  - record quick actions
  - update center
  - feedback entry
- Added `v1.0.0-rc` to the update center.
- Updated release notes to describe the release candidate and stop point.
- Removed sensitive unlaunched capability wording from user-facing release notes.

## 4. Guardrails

- No parser changes.
- No account, database, cloud sync, backend, or API key.
- No manual `gh-pages` edit.
- No claims about background delivery, prediction, trading, or automatic sync.
- `E:\lifetime` was not modified.

## 5. Tests

New v1.0.0-rc test:

```text
node scripts\test-shike-v100rc-release.js
v1.0.0-rc release regression passed: 40/40
```

Regression suite:

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
Runtime CDP acceptance passed: 11/11
```

NLP note: 本轮未改 parser；当前仓库未发现可用 `test-shike-nlp-parser.js`，未声明 NLP 数字结果。

## 6. Runtime Coverage

- Viewports: 375, 390, 414, 768, 1024, 1366, 1440
- Pages: Home, All, Calendar, Import, My
- Checks: no white screen, no horizontal overflow, bottom nav visible, sprite not blocking controls, feature hub visible, product positioning visible, capability checklist visible, export/backup/feedback visible, and no app-level JS errors.

## 7. Rollback

Deploy rollback tag:

```text
shike-web-stable-before-v100rc-rematch-release
```

Rollback command:

```text
git switch main
git reset --hard shike-web-stable-before-v100rc-rematch-release
git push origin main --force-with-lease
```

## 8. Deploy Recommendation

Ready to deploy v1.0.0-rc if main is still at `db1d4c8234544213a6f66078246230678cd5bc6f` and key checks pass again on main after merge.

After v1.0.0-rc deploy, stop automatic development and do not continue to v1.0.1.
