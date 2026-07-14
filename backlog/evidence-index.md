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

- Offline startup.
- Service Worker update rehearsal.
- Notification/microphone permission denial.
- Trash, snapshot, and invalid-password recovery.

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

## Stage 1 Hardening Evidence

- Command：`npm run test:e2e:ci`。
- Browser：Edge 150.0.4078.65，CDP 1.3。
- Runtime：PASS，11/11。
- Viewports：375、390、414、768、1024、1366、1440；7/7 screenshots。
- Error evidence：console、runtime、log、network errors = 0。
- Artifacts：`artifacts/ci-e2e/browser-metadata.json`、`runtime-result.json`、`e2e-runner-result.json`、`home-*.png`。
- CI gate regression：4/4，覆盖无锁零依赖、缺锁依赖失败、optional SKIPPED、required SKIPPED failure。
- Test integrity：630/630，skipped=0，无 allowlist。
- Legacy：66/66。
- Parser：102/102。

这些产物保持本地忽略；远端 CI 将通过 `actions/upload-artifact` 上传同结构证据。
