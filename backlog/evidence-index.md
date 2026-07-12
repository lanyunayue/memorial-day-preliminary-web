# Evidence Index

## Stage 0 Evidence

- `docs/day-work/v210a2-self-evaluation.md`
- `docs/day-work/v210a2-investment-hardening-report.md`
- Commands run locally:
  - `git status --short`
  - `git diff origin/main...HEAD --stat`
  - `git diff origin/main...HEAD --name-status`
  - `git diff origin/main...HEAD`
  - `git diff --check`
  - `npm run lint`
  - `npm run format:check`
  - `npm run test:unit`
  - `npm run test:legacy`
  - `node scripts/test-shike-sprite-create-intent.js`
  - `npm run test:a11y`
  - `npm run test:security`
  - `node scripts/test-shike-test-integrity.js`
  - `npm run test:e2e`

## Missing Evidence

- Full real browser alpha2 run.
- Offline startup.
- Service Worker update rehearsal.

## Stage 1 Browser Evidence

- `docs/day-work/v210a2-browser-validation.md`
- `artifacts/v210a2/browser/browser-metadata.json`
- `artifacts/v210a2/browser/experience-runtime-result.json`
- `artifacts/v210a2/browser/v141-home-*.png`
- `test-results/v210a2/runtime-cdp.log`
- `test-results/v210a2/layout-cdp.log`

Status:

- Runtime CDP：PASS，11/11。
- Layout baseline：PASS，9/9。
- Playwright：NOT RUN。
- Full alpha2 browser acceptance：NOT COMPLETE。
