# QUALITY GATES

## Required Gates

| Gate | Command or Evidence | Alpha2 Merge | Deploy |
|---|---|---|---|
| Git status | `git status --short` clean | Required | Required |
| Main freshness | `git fetch origin --prune` succeeds | Required | Required |
| Diff check | `git diff --check` | Required | Required |
| Lint | `npm run lint` | Required | Required |
| Format | `npm run format:check` | Required | Required |
| Unit | `npm run test:unit` | Required | Required |
| Legacy | `npm run test:legacy` | Required | Required |
| Parser | `node scripts/test-shike-sprite-create-intent.js` | Required | Required |
| A11y | `npm run test:a11y` | Required | Required |
| Security | `npm run test:security` | Required | Required |
| Test Integrity | `node scripts/test-shike-test-integrity.js` | Required | Required |
| Browser | CDP or Playwright evidence | Required or explicitly waived for CI-only merge | Required |

## Classification Rule

PASS, FAIL, SKIPPED, and NOT RUN must be separate. SKIPPED is acceptable evidence of honesty, not evidence of correctness.
