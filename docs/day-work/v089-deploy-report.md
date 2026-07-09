# Shike v0.8.9 Deploy Report

Generated at: 2026-07-09 17:05 +08:00

## Release

- Version: `v0.8.9`
- Feature theme: batch draft existing-record dedupe
- Online URL: `https://lanyunayue.github.io/memorial-day-preliminary-web/`
- Main commit deployed: `8e00ffe4b84373322c792ec367028d3cec95abca`
- Feature commit: `0981c89db483cf0b45c159349cbac5dc5e119c5d`
- Candidate report commit: `8e00ffe4b84373322c792ec367028d3cec95abca`
- Backup tag: `shike-web-stable-before-v089-draft-existing-dedupe`
- Backup tag target: `7f85f9f94ef295d0cb9827128ea9c1ad6677003b`

## What Changed

v0.8.9 prevents batch capture from saving drafts that already match saved records. Existing duplicates now show `已存在` in the draft list and are skipped by both single-draft save and save-all.

No UI redesign, parser rewrite, theme change, responsive layout change, weather change, backup flow change, or gh-pages manual edit was made.

## Verification Before Push

- `node scripts\test-shike-regression-suite.js`
  - Passed: `Shike clean candidate suite: 25/25 passed`
- `node scripts\test-shike-draft-existing-dedupe.js`
  - Passed: `Draft existing dedupe regression passed: 6/6`
- `node scripts\test-shike-batch-dedupe.js`
  - Passed: `Batch dedupe regression passed: 6/6`

Runtime VM check on main:

- Existing record: `明天下午三点开会`
- Batch input:
  - `明天下午三点开会`
  - `每月15号还信用卡`
  - `随便记个想法`
- Drafts created: 3
- Existing duplicates detected: 1
- Records after save-all: 3
- Meeting duplicate count: 1
- Credit-card record saved: yes
- Note record saved: yes

Local Edge screenshot load check:

- 375 x 900: generated successfully.
- 1366 x 900: generated successfully.

NLP note:

- The current E-drive Web repo does not contain `scripts/test-shike-nlp-parser.js`.
- v0.8.9 did not modify NLP parsing logic.

## Deployment

- Pushed backup tag: yes.
- Pushed `main`: yes.
- Pushed `gh-pages`: no.
- Manual deployment command: none.
- GitHub Pages source remains the existing repository configuration.

## Online Verification

Formal root address checked without using a version query parameter:

- URL: `https://lanyunayue.github.io/memorial-day-preliminary-web/`
- Online `APP_VERSION`: `v0.8.9`
- Online `APP_UPDATED_AT`: `2026-07-09 14:03`
- Online Service Worker cache: `shike-v089-v35`
- Online update observed on poll attempt: 3

Online Edge screenshot load check:

- 375 x 900: generated successfully.
- 1366 x 900: generated successfully.

## Repository State

- Local main HEAD after deployment: `8e00ffe4b84373322c792ec367028d3cec95abca`
- Remote main HEAD after deployment: `8e00ffe4b84373322c792ec367028d3cec95abca`
- Working tree after deployment report creation: report pending at time of writing.
- `E:\lifetime` modified: no.
- D-drive backup deleted: no.

## Recommendation

v0.8.9 is live and should be kept. The next safe improvement theme should remain small and user-visible, preferably another data-quality or trust improvement rather than a broad UI rebuild.
