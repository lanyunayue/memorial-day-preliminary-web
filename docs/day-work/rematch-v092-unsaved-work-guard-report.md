# Shike v0.9.2 Unsaved Work Guard Candidate Report

Generated at: 2026-07-09 21:51 +08:00

## Summary

v0.9.2 adds a browser-native leave-page guard for unsaved work. If the user has typed a quick input, filled batch text, generated batch drafts, or opened a parse preview without saving, refreshing or closing the page asks for confirmation.

This is a narrow trust and data-safety improvement. It does not change the visual style, parser rules, storage format, theme system, responsive layout, weather, calendar export, backup flow, or demo route design.

## Branch

- Main Web repo: `E:\lifetime-web`
- Worktree: `E:\lifetime-web-v092-unsaved-work-guard`
- Branch: `rematch-v092-unsaved-work-guard`
- Base commit: `6af67b235b4cb58f9aefcc869d9d96f6659b1094`
- Candidate implementation commit: `c2b41c9b0cddefe136396706622d30c6bda9f58e`

## Changed Files

- `index.html`
  - Updated `APP_VERSION` to `v0.9.2`.
  - Updated `APP_UPDATED_AT` to `2026-07-09 21:51`.
  - Added `hasUnsavedWork()`.
  - Added `registerUnsavedWorkGuard()`.
  - Registered a `beforeunload` listener during `init()`.
- `sw.js`
  - Updated cache to `shike-v092-v38`.
- `scripts/test-shike-unsaved-work-guard.js`
  - New regression coverage for static structure and VM runtime behavior.
- Version expectation updates:
  - `scripts/test-shike-time-sprite.js`
  - `scripts/test-shike-backup-hardening.js`
  - `scripts/test-shike-demo-route.js`
  - `scripts/test-shike-runtime-cdp.js`
- `scripts/test-shike-regression-suite.js`
  - Added unsaved work guard test.

## User-Visible Effect

The page now asks the browser to confirm before leaving when unsaved work exists:

- quick input has non-whitespace text
- batch import textarea has non-whitespace text
- batch drafts exist
- parse preview is open

The guard does not trigger after saving all drafts, discarding drafts, clearing inputs, or when the page is otherwise clean.

## Verification

- `node scripts\test-shike-unsaved-work-guard.js`
  - Passed: `Unsaved work guard regression passed: 6/6`
- `node scripts\test-shike-time-sprite.js`
  - Passed: `Time sprite regression passed: 8/8`
- `node scripts\test-shike-backup-hardening.js`
  - Passed: `Backup hardening regression passed: 11/11`
- `node scripts\test-shike-demo-route.js`
  - Passed: `Demo route regression passed: 18/18`
- `node scripts\test-shike-regression-suite.js`
  - Passed: `Shike clean candidate suite: 28/28 passed`
- Local Edge CDP runtime:
  - Passed: `Runtime CDP acceptance passed: 10/10`

## Runtime Acceptance Details

The new VM regression checked:

- clean page does not block `beforeunload`
- quick input blocks `beforeunload`
- import textarea blocks `beforeunload`
- batch drafts block `beforeunload`
- parse preview blocks `beforeunload`
- save-all and discard clear the guarded draft state

The Edge CDP runtime test directly dispatched `beforeunload`:

- clean state: not prevented
- dirty quick input state: prevented

## Guardrails

- No parser change.
- No UI redesign.
- No theme change.
- No responsive layout change.
- No storage schema change.
- No Service Worker behavior change beyond cache version.
- No changes under `E:\lifetime`.
- The E-drive Web repo still does not contain `scripts\test-shike-nlp-parser.js`, so no NLP 102/102 claim is made.

## Deployment State

- Pushed: no.
- Deployed: no.
- Merged to main: no.
- `gh-pages` modified: no.

## Recommendation

This is a clean v0.9.2 release candidate. It is suitable to fast-forward into `main`, rerun the regression and runtime gates on main, push, and verify the live root URL updates to v0.9.2.
