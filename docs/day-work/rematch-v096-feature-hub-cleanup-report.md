# Shike v0.9.6 Feature Hub Cleanup Report

Generated: 2026-07-10 10:25 +08:00

## 1. Candidate

- Workspace: `E:\lifetime-web-v096-feature-hub-cleanup`
- Branch: `rematch-v096-feature-hub-cleanup`
- Baseline main: `f8e103292b2d73e085071b640b05b10dd0033619`
- Product commit: `64d8bc906e1bd5d343701a891fe522e7047de823`
- Version: `v0.9.6`
- Service worker cache: `shike-v096-v42`

## 2. Scope

Implemented the v0.9.6 home/My-page cleanup by adding a lightweight `功能中心` in the My page and keeping Home focused on the main capture flow.

Changed files:

- `index.html`
- `sw.js`
- `scripts/test-shike-backup-hardening.js`
- `scripts/test-shike-demo-route.js`
- `scripts/test-shike-feature-hub-cleanup.js`
- `scripts/test-shike-my-page-priority.js`
- `scripts/test-shike-regression-suite.js`
- `scripts/test-shike-release-notes.js`
- `scripts/test-shike-runtime-cdp.js`
- `scripts/test-shike-sprite-assistant-2.js`
- `scripts/test-shike-time-sprite.js`

## 3. Product Changes

- Added `featureHubSection` directly after personalization in My.
- Feature hub entries:
  - Example records
  - Demo route
  - Version updates
  - Data safety
  - Calendar export
  - Feedback
  - Future plans
- Each entry calls existing functions or jumps to existing sections; no duplicate implementation was introduced.
- Home stays simplified: example chips and demo route remain muted from Home.
- Existing standalone sections remain available because they contain actual controls and detailed copy. The hub is an entry aggregator, not a replacement implementation.
- Release notes copy was updated for v0.9.6.

## 4. Duplicate Entry Strategy

- High-frequency entry points now live in the feature hub and bear assistant shortcuts.
- Home remains capture-first and avoids example/help stacking.
- Existing sections are retained as destinations because removing them would remove controls, detail text, or tests.
- Example records still have a single `demoBtnMy`; the hub links to that section instead of creating a second data-generation flow.

## 5. Guardrails

- No parser changes.
- No account, database, cloud sync, API, or real Agent work.
- No manual `gh-pages` edits.
- No change to `E:\lifetime`.
- No claims of background sync, stock monitoring, or automated trading.

## 6. Tests

New v0.9.6 test:

```text
node scripts\test-shike-feature-hub-cleanup.js
Feature hub cleanup regression passed: 22/22
```

Regression suite:

```text
node scripts\test-shike-regression-suite.js
Shike clean candidate suite: 36/36 passed in 3888ms
```

Runtime Edge CDP:

```text
node scripts\test-shike-runtime-cdp.js
Runtime CDP acceptance passed: 11/11
```

Individual existing scripts were also run. Existing scripts passed. Missing scripts recorded:

- `test-shike-existing-dedupe.js`
- `test-shike-batch-capture.js`
- `test-shike-nlp-parser.js`

NLP note: 本轮未改 parser；当前仓库未发现可用 `test-shike-nlp-parser.js`，未声明 NLP 数字结果。

## 7. Runtime Coverage

- Viewports: 375, 390, 414, 768, 1024, 1366, 1440
- Pages: Home, All, Calendar, Import, My
- Checks: no horizontal overflow, no white screen, bottom nav visible, sprite not blocking controls, feature hub visible, data safety/export/feedback available, and no app-level JS errors.

## 8. Rollback

Deploy rollback tag:

```text
shike-web-stable-before-v096-feature-hub-cleanup
```

Rollback command:

```text
git switch main
git reset --hard shike-web-stable-before-v096-feature-hub-cleanup
git push origin main --force-with-lease
```

## 9. Deploy Recommendation

Ready to deploy v0.9.6 if main is still at `f8e103292b2d73e085071b640b05b10dd0033619` and key checks pass again on main after merge.

