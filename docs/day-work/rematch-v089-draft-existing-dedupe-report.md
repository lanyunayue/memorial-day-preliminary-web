# Shike v0.8.9 Draft Existing Dedupe Candidate Report

Generated at: 2026-07-09 16:56:56 +08:00

## Summary

v0.8.9 focuses on one data-quality improvement: batch capture drafts now detect records that already exist in the user's saved list. Existing duplicates are marked in the draft list and skipped when saving a single draft or saving all drafts.

This keeps the current v0.8.x visual style and page structure unchanged. No parser, theme, responsive layout, weather, backup import/export, or PWA behavior was redesigned.

## Branch

- Main Web repo: `E:\lifetime-web`
- Worktree: `E:\lifetime-web-v089-draft-existing-dedupe`
- Branch: `rematch-v089-draft-existing-dedupe`
- Base before work: `7f85f9f94ef295d0cb9827128ea9c1ad6677003b`
- Candidate commit: `0981c89db483cf0b45c159349cbac5dc5e119c5d`

## Changed Files

- `index.html`
  - Updated `APP_VERSION` to `v0.8.9`.
  - Updated `APP_UPDATED_AT` to `2026-07-09 14:03`.
  - Added `getRecordDuplicateKey(record)`.
  - Added `isDraftExistingDuplicate(draft)`.
  - Added `已存在` chip for batch drafts matching existing records.
  - Added duplicate guard to `saveDraft(i)`.
  - Added duplicate skip to `saveAllDrafts()`.
- `sw.js`
  - Updated cache name to `shike-v089-v35`.
- `scripts/test-shike-draft-existing-dedupe.js`
  - New regression test for existing-record duplicate prevention.
- `scripts/test-shike-regression-suite.js`
  - Added the new draft existing dedupe test.
- `scripts/test-shike-time-sprite.js`
  - Updated version/cache expectations.
- `scripts/test-shike-backup-hardening.js`
  - Updated backup version expectation.

## Behavior Before

If a user already had `明天下午三点开会`, then pasted a batch containing the same line again, the batch draft could be saved again. This created duplicate records even though v0.8.8 already removed duplicates within the pasted batch itself.

## Behavior After

When a batch draft matches an existing saved record by title/date/time/repeat/type:

- The draft list shows `已存在`.
- Saving that single draft skips it and removes the draft.
- Saving all drafts skips existing duplicates and saves only genuinely new drafts.
- The existing record is preserved.
- Other new drafts in the same batch still save normally.

## Validation

### Static / Regression Tests

- `node scripts\test-shike-draft-existing-dedupe.js`
  - Passed: `Draft existing dedupe regression passed: 6/6`
- `node scripts\test-shike-batch-dedupe.js`
  - Passed: `Batch dedupe regression passed: 6/6`
- `node scripts\test-shike-time-sprite.js`
  - Passed: `Time sprite regression passed: 8/8`
- `node scripts\test-shike-backup-hardening.js`
  - Passed: `Backup hardening regression passed: 11/11`
- `node scripts\test-shike-regression-suite.js`
  - Passed: `Shike clean candidate suite: 25/25 passed`

### Runtime Behavior Check

Executed the current `index.html` script in the same VM-style harness used by existing tests:

- Existing saved record: `明天下午三点开会`
- Batch input:
  - `明天下午三点开会`
  - `每月15号还信用卡`
  - `随便记个想法`
- Drafts created: 3
- Drafts detected as already existing: 1
- Records before save-all: 1
- Records after save-all: 3
- Meeting duplicate count after save-all: 1
- New credit-card record saved: yes
- New note record saved: yes
- Draft list cleared after save-all: yes

### Browser Load Check

Started a local static server at `http://127.0.0.1:8098/` and generated Edge headless screenshots:

- 375 x 900: screenshot generated successfully.
- 1366 x 900: screenshot generated successfully.

Playwright could not be used because the bundled `playwright` package was missing `playwright-core`. Edge CDP was also blocked by the local Edge session, so interactive browser automation was replaced by VM runtime validation plus Edge render screenshots.

### NLP

The current E-drive Web worktree does not contain `scripts/test-shike-nlp-parser.js`. The available old NLP script is hard-coded to a different legacy path, so it was not used as a result for this candidate. v0.8.9 did not modify NLP parsing logic.

## Deployment State

- Pushed: no.
- Deployed: no.
- Merged to `main`: no.
- `gh-pages` modified: no.
- `E:\lifetime` modified: no.

## Recommendation

This branch is a clean v0.8.9 release candidate. It is low-risk because it only blocks duplicate saves from batch drafts against existing records and leaves the product style and parser behavior unchanged.

Recommended next step: run a final main remote check, fast-forward merge into `E:\lifetime-web` main, run the full regression suite on main, push, then verify the online root URL updates to v0.8.9.
