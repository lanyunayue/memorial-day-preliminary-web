# Shike v0.9.0 Demo Route Report

Date: 2026-07-09
Branch: rematch-v090-rematch-demo-mode
Worktree: E:\lifetime-web-v090-rematch-demo-mode

## Scope

- Added a lightweight "演示路线" entry near the home today overview.
- Route subtitle: "从一句话到日历，看看时刻如何整理你的时间。"
- Added five route steps: 一句话创建, 批量整理, 去重保护, 接入日历, 数据安全.
- Route is collapsed by default and remembers state in `shike_demo_route_collapsed`.
- Example sentence fills the home input and opens parse preview only.
- Batch route fills the import textarea and prepares drafts only.
- Calendar and data-safety actions jump to the existing My page sections.
- Updated `APP_VERSION` to `v0.9.0`.
- Updated `APP_UPDATED_AT` to `2026-07-09 20:47`.
- Updated service worker cache to `shike-v090-v36`.
- Added an inline favicon to avoid browser-default `/favicon.ico` 404 console noise.

## Non-Scope Kept

- No cloud sync.
- No login.
- No database.
- No Google Calendar API.
- No LLM API.
- No parser rewrite.
- No UI rewrite.
- No v0.9.1 work.
- No changes under `E:\lifetime`.

## Tests

- `node scripts\test-shike-demo-route.js`: passed, 18/18.
- `node scripts\test-shike-html-integrity.js`: passed, 7/7.
- `node scripts\test-shike-i18n-placeholders.js`: passed, 6/6.
- `node scripts\test-shike-responsive-css.js`: passed, 9/9.
- `node scripts\test-shike-regression-suite.js`: passed, 26/26.
- `node scripts\test-shike-runtime-cdp.js`: passed, 9/9 against local Edge CDP.

## Runtime Acceptance

Local app URL: `http://127.0.0.1:8090/index.html`
Edge CDP URL: `http://127.0.0.1:9224`

Checked viewports:

- 375
- 390
- 414
- 768
- 1024
- 1366
- 1440

Checked pages:

- Home
- All
- Calendar
- Import
- My

Runtime checks covered:

- Home opened with `APP_VERSION` v0.9.0 and no route shell failure.
- No horizontal overflow across all requested viewport/page combinations.
- Route title/subtitle present.
- Route default collapsed and localStorage state remembered.
- Five route steps render after expand.
- Sentence demo fills `明天下午三点开会`, opens parse preview, and does not save records.
- Batch demo fills four example lines, prepares drafts, and does not save records.
- Calendar and data-safety route buttons jump to existing My page sections.
- Existing demo examples still add 5 records.
- Batch dedupe still removes duplicate lines.
- Night theme route remains readable.
- Weather, background picker, and language switching remain callable and stable.
- No runtime console or JavaScript errors after favicon fix.

## Script Name Notes

These user-listed legacy names are not present in this repo:

- `scripts\test-shike-nlp-parser.js`
- `scripts\test-shike-existing-dedupe.js`
- `scripts\test-shike-batch-capture.js`

Existing equivalent coverage that passed:

- `scripts\test-shike-draft-existing-dedupe.js`
- `scripts\test-shike-batch-capture-inbox.js`
- Parser behavior is covered by parse preview, batch capture, demo route, and related regression tests, but no NLP 102/102 claim is made because the NLP parser script is absent in this repo.

## Diff Control

- `index.html`: about +218 / -10 before reports.
- No full-file formatting.
- CSS change is small and localized to the demo route block.
- No layout rewrite.

## Decision

The v0.9.0 demo route candidate is ready to commit and deploy after main-repo verification.
