# Shike v2.2.0-alpha4 GA Browser Foundation Report

Date: 2026-07-19

## Outcome

This candidate turns the existing single-browser Playwright run into an explicit four-browser quality gate. Chromium, Microsoft Edge, Firefox, and WebKit now launch as separate projects and run the same product-truth suite. Product source, UI, data schema, public version, Service Worker cache version, and deployed files are unchanged.

## Candidate

- Worktree: `E:\lifetime-web-v220a4-ga-foundation`
- Branch: `program-v220a4-ga-foundation`
- Base: `53df9c6520d281c13cfc100061596f9ea167370a`
- Implementation commit: `972eda2a9c8cd7b10bfa5c4fb384a90c3b4dda70`
- Public product baseline: `66df442c93aaa27e491c543bdeac4317b9c611f9`
- Product version: `v2.2.0-alpha3.1` (unchanged)
- Public URL: `https://lanyunayue.github.io/memorial-day-preliminary-web/` (unchanged)

## Scope

Changed files:

- `.github/workflows/ci.yml`
- `package.json`
- `playwright.config.js`
- `e2e/browser-identity.spec.js`
- `e2e/product-truth.spec.js`
- `e2e/service-worker.spec.js`
- `docs/program/v220a4-ga-browser-foundation-report.md`

No changes were made to `index.html`, CSS, application modules, NLP rules, persistence formats, `version.js`, `sw.js`, `manifest.json`, or deployment configuration.

## Browser Gate Design

| Project | Engine | CI runner | Product truth | PWA cache | Offline launch |
| --- | --- | --- | --- | --- | --- |
| Chromium | Chromium | Ubuntu | Required | Required | Required |
| Edge | Chromium / `msedge` channel | Windows | Required | Required | Required |
| Firefox | Firefox | Ubuntu | Required | Required | Required |
| WebKit | WebKit | Ubuntu | Required | Required | Tool limitation |

Browser identity is asserted from both the Playwright engine fixture and the runtime user agent. This prevents a mislabeled Chromium run from being reported as Edge, Firefox, or WebKit.

The WebKit offline-reload case is explicitly skipped because Playwright documents Service Worker automation as Chromium-only. WebKit still runs startup, console cleanliness, IndexedDB durability, search, calendar dot, encrypted backup, all viewport checks, Service Worker registration, current-cache creation, and stale-cache removal. The limitation is visible in test output and is not counted as a pass.

Reference: https://playwright.dev/docs/api/class-browsercontext#browser-context-service-workers

## Responsive Matrix

Every browser runs horizontal-overflow, composer visibility, and navigation visibility checks at:

- `320x568`
- `360x800`
- `375x812`
- `390x844`
- `412x915`
- `430x932`
- `768x1024`
- `820x1180`
- `1024x768`
- `1280x720`
- `1366x768`
- `1440x900`
- `1920x1080`
- `2560x1440`

Result: all 56 browser/viewport combinations passed with no horizontal overflow.

## Verification

### Full repository gate

`npm run test:all`: PASS

- Lint: PASS
- Format: PASS
- Unit: `27/27`
- Legacy regression suite: PASS
- NLP create-intent regression: `102/102`
- Accessibility: PASS
- Security: PASS
- CI gate regression: PASS
- Test integrity: `690/690`
- Playwright: `27 passed`, `1 explicitly skipped`
- Optional CDP call inside `test:all`: skipped by its existing optional contract

### Required browser gate

`npm run test:cdp` with local Microsoft Edge: `7/7` suites passed.

- Agent runtime: `12/12`
- Experience runtime: `30/30`
- Offline runtime: `3/3`
- Runtime: `11/11`
- Storage runtime: `10/10`
- Network acceptance: GitHub `5`, weather `1`
- Responsive acceptance: `12/12`, 3D scene nonblank

### Temporal and resilience gate

- NLP create intent: `102/102`
- Temporal corpus: `706/706`
- Temporal property regression: `1200/1200`
- Fault recovery: `43/43`
- Storage migration: `14/14`
- Conflict engine: `17/17`
- Cited temporal memory: `16/16`
- Reversible adaptation: `20/20`

## Failure Review

The first four-browser run produced `23/24`: WebKit reported an internal Playwright error when `page.reload()` was called after network emulation was switched offline. A second native reload experiment also could not produce a WebKit navigation event. Product behavior before that unsupported operation was healthy.

The Service Worker test was then separated into two honest gates:

1. Cache replacement runs on all four browsers.
2. Offline relaunch runs on Chromium, Edge, and Firefox; WebKit is explicitly skipped with the automation limitation shown in output.

The final complete run produced `27 passed`, `1 skipped`, and exit code `0`.

## Visual Evidence

Required CDP validation generated phone, tablet, desktop, and wide-desktop screenshots under `artifacts/cdp/`. Manual inspection of `375x667` and `1366x768` confirmed the established visual style, visible composer and navigation, and no incoherent overlap.

## CI Change

The Ubuntu job installs and requires Chromium, Firefox, and WebKit. A separate Windows job requires the system Microsoft Edge channel. Edge failure traces and screenshots are uploaded as CI artifacts. The existing CDP, stress, static asset, and Service Worker checks remain in place.

Remote branch validation completed successfully:

- Actions run: `29681804142`
- Run URL: https://github.com/lanyunayue/memorial-day-preliminary-web/actions/runs/29681804142
- Windows `edge` job: success
- Ubuntu `test` job: success
- Overall conclusion: success

## Risk And Rollback

Risk is limited to test and CI infrastructure. No application byte changed. The candidate can be rolled back by reverting its single commit or deleting the isolated branch/worktree before merge.

## Release Recommendation

Keep this branch as the GA browser-foundation candidate. It has passed both the remote Linux portable-browser job and the Windows Edge job. Do not change the public product version or deploy solely for this test-infrastructure change. It is now eligible for a controlled merge after review.

The candidate branch was pushed for remote CI validation. No merge, deployment, main-branch modification, or public-site modification was performed.
