# Shike v0.9.1 Deploy Report

Generated at: 2026-07-09 21:45 +08:00

## Release

- Version: `v0.9.1`
- Feature theme: batch save feedback
- Online URL: `https://lanyunayue.github.io/memorial-day-preliminary-web/`
- Main release commit: `d8f18183aaf90905176b9dc926a9c1d8d0bdaf00`
- Implementation commit: `9bd0b12a6e4e24d4c0a747db7f559e14a0907d10`
- Candidate report commit: `d8f18183aaf90905176b9dc926a9c1d8d0bdaf00`
- Stable rollback tag: `shike-web-stable-before-v091-batch-save-feedback`
- Rollback tag target: `f3b641696d3446973c80381d9738324edc4e4ef3`

## What Changed

Batch save-all now reports the real result:

- saved-only: saved count
- mixed: saved count plus skipped duplicate count
- skipped-only: no new records plus skipped duplicate count

The duplicate draft chip, duplicate skip toast, and save-all button now use localized text keys instead of hardcoded Chinese.

## Local Verification Before Push

- `node scripts\test-shike-regression-suite.js`
  - Passed: `Shike clean candidate suite: 27/27 passed`
- `node scripts\test-shike-batch-save-feedback.js`
  - Passed: `Batch save feedback regression passed: 6/6`
- Local Edge CDP runtime:
  - Passed: `Runtime CDP acceptance passed: 9/9`

## Deployment

- Fast-forward merged `rematch-v091-batch-save-feedback` into `main`.
- Pushed rollback tag: yes.
- Pushed `main`: yes.
- Manually updated `gh-pages`: no.
- Changed `E:\lifetime`: no.

## Online Verification

Formal root address checked without a query parameter:

- URL: `https://lanyunayue.github.io/memorial-day-preliminary-web/`
- Online `APP_VERSION`: `v0.9.1`
- Online `APP_UPDATED_AT`: `2026-07-09 21:39`
- Online Service Worker cache: `shike-v091-v37`
- Online update observed on poll attempt: 2
- Online Edge CDP runtime:
  - Passed: `Runtime CDP acceptance passed: 9/9`

## Notes

- This release did not modify parser rules.
- The E-drive Web repo still does not contain `scripts\test-shike-nlp-parser.js`, so no NLP 102/102 claim is made.
- Product style, theme, responsive layout, weather, backup format, and demo route behavior were kept intact.

## Recommendation

v0.9.1 is live and should be kept. Next candidates should continue prioritizing small trust and data-quality improvements over broad UI redesigns.
