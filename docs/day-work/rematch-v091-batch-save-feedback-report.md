# Shike v0.9.1 Batch Save Feedback Candidate Report

Generated at: 2026-07-09 21:39 +08:00

## Summary

v0.9.1 improves trust in batch capture. When the user saves all drafts, Shike now reports how many drafts were saved and how many existing duplicates were skipped.

This is a narrow product-polish release. It does not redesign UI, change parser rules, change themes, change responsive layout, or add backend/cloud features.

## Branch

- Main Web repo: `E:\lifetime-web`
- Worktree: `E:\lifetime-web-v091-batch-save-feedback`
- Branch: `rematch-v091-batch-save-feedback`
- Base commit: `f3b641696d3446973c80381d9738324edc4e4ef3`
- Candidate implementation commit: `9bd0b12a6e4e24d4c0a747db7f559e14a0907d10`

## Changed Files

- `index.html`
  - Updated `APP_VERSION` to `v0.9.1`.
  - Updated `APP_UPDATED_AT` to `2026-07-09 21:39`.
  - Added localized draft/save-all feedback strings in zh-CN, zh-TW, en, and ja.
  - Existing duplicate draft chip now uses localized `draftExisting`.
  - Single duplicate draft skip now uses localized `draftDuplicateSkipped`.
  - Save-all now shows actual saved/skipped counts:
    - saved only
    - saved plus skipped duplicates
    - skipped-only, no new records
- `sw.js`
  - Updated cache to `shike-v091-v37`.
- `scripts/test-shike-batch-save-feedback.js`
  - New static and VM runtime regression coverage.
- Version expectation updates:
  - `scripts/test-shike-time-sprite.js`
  - `scripts/test-shike-backup-hardening.js`
  - `scripts/test-shike-demo-route.js`
  - `scripts/test-shike-runtime-cdp.js`
- Regression suite update:
  - `scripts/test-shike-regression-suite.js`
- Existing duplicate test cleanup:
  - `scripts/test-shike-draft-existing-dedupe.js` now checks i18n keys instead of hardcoded Chinese text.

## User-Visible Effect

Before:

- Batch save-all skipped existing duplicates internally but still showed a generic saved message.
- A user could not tell whether duplicates were skipped or whether every draft was saved.

After:

- Mixed case: `已保存 2 条，跳过 1 条重复`
- Saved-only case: `已保存 3 条`
- Skipped-only case: `没有新增，已跳过 1 条重复`
- The duplicate chip and single duplicate skip toast are localized.

## Verification

- `node scripts\test-shike-batch-save-feedback.js`
  - Passed: `Batch save feedback regression passed: 6/6`
- `node scripts\test-shike-draft-existing-dedupe.js`
  - Passed: `Draft existing dedupe regression passed: 6/6`
- `node scripts\test-shike-demo-route.js`
  - Passed: `Demo route regression passed: 18/18`
- `node scripts\test-shike-time-sprite.js`
  - Passed: `Time sprite regression passed: 8/8`
- `node scripts\test-shike-backup-hardening.js`
  - Passed: `Backup hardening regression passed: 11/11`
- `node scripts\test-shike-i18n-placeholders.js`
  - Passed: `I18N placeholder regression passed: 6/6`
- `node scripts\test-shike-html-integrity.js`
  - Passed: `HTML integrity regression passed: 7/7`
- `node scripts\test-shike-regression-suite.js`
  - Passed: `Shike clean candidate suite: 27/27 passed`
- Local Edge CDP runtime:
  - Passed: `Runtime CDP acceptance passed: 9/9`

## Runtime Acceptance Details

The new VM runtime test covered:

- Existing record: `明天下午三点开会`
- Save-all batch:
  - `明天下午三点开会`
  - `每月15号还信用卡`
  - `随便记个想法`
- Result:
  - 2 new records saved.
  - 1 duplicate skipped.
  - Duplicate meeting count stayed at 1.
  - Toast reported saved/skipped counts.

The skipped-only path was also verified:

- Existing record: `明天下午三点开会`
- Draft: `明天下午三点开会`
- Result:
  - Record count stayed unchanged.
  - Toast type was `warn`.
  - Toast reported no new records and 1 skipped duplicate.

## Guardrails

- No parser change.
- No NLP test claim; this repo still does not contain `scripts\test-shike-nlp-parser.js`.
- No UI redesign.
- No theme change.
- No responsive layout change.
- No weather/multilingual system rewrite.
- No backup format change.
- No changes under `E:\lifetime`.

## Deployment State

- Pushed: no.
- Deployed: no.
- Merged to main: no.
- `gh-pages` modified: no.

## Recommendation

This is a clean, low-risk v0.9.1 release candidate. It is suitable to fast-forward into `main`, run the same regression gates on main, push, and verify the live root URL updates to v0.9.1.
