# Shike v0.9.2 Deploy Report

Generated at: 2026-07-09 22:03 +08:00

## Release

- Version: `v0.9.2`
- Feature theme: unsaved work leave-page guard
- Online URL: `https://lanyunayue.github.io/memorial-day-preliminary-web/`
- Main release commit: `a1af81421172256257e3ddf12b264ebcb8e3d5fc`
- Implementation commit: `c2b41c9b0cddefe136396706622d30c6bda9f58e`
- Candidate report commit: `a1af81421172256257e3ddf12b264ebcb8e3d5fc`
- Intended rollback tag: `shike-web-stable-before-v092-unsaved-work-guard`
- Rollback tag target: `6af67b235b4cb58f9aefcc869d9d96f6659b1094`

## What Changed

v0.9.2 adds a browser-native leave-page guard for unsaved work. The guard triggers when the user has:

- non-empty quick input
- non-empty batch import text
- generated batch drafts
- an active parse preview

Clean pages do not trigger the guard. Saving or discarding drafts clears the guarded state.

## Local Verification Before Push

- `node scripts\test-shike-regression-suite.js`
  - Passed: `Shike clean candidate suite: 28/28 passed`
- `node scripts\test-shike-unsaved-work-guard.js`
  - Passed: `Unsaved work guard regression passed: 6/6`
- Local Edge CDP runtime:
  - Passed: `Runtime CDP acceptance passed: 10/10`

## Deployment

- Fast-forward merged `rematch-v092-unsaved-work-guard` into `main`.
- Pushed `main`: yes.
- Manually updated `gh-pages`: no.
- Changed `E:\lifetime`: no.
- Parser changed: no.

## Rollback Tag Status

The local rollback tag was created:

- `shike-web-stable-before-v092-unsaved-work-guard`
- target: `6af67b235b4cb58f9aefcc869d9d96f6659b1094`

Pushing the tag failed repeatedly with GitHub HTTPS network errors:

- `OpenSSL SSL_connect: SSL_ERROR_SYSCALL in connection to github.com:443`

GitHub API confirmed the tag is not present remotely at report time. Main deployment was not blocked because remote main was pushed and verified. The tag should be pushed later when the GitHub HTTPS connection is stable:

```powershell
git push origin shike-web-stable-before-v092-unsaved-work-guard
```

## Online Verification

Formal root address checked without a query parameter:

- URL: `https://lanyunayue.github.io/memorial-day-preliminary-web/`
- Online `APP_VERSION`: `v0.9.2`
- Online `APP_UPDATED_AT`: `2026-07-09 21:51`
- Online Service Worker cache: `shike-v092-v38`
- Online update observed on poll attempt: 1
- Online Edge CDP runtime:
  - Passed: `Runtime CDP acceptance passed: 10/10`

## Notes

- This release did not modify NLP parser rules.
- The E-drive Web repo still does not contain `scripts\test-shike-nlp-parser.js`, so no NLP 102/102 claim is made.
- Product style, theme, responsive layout, weather, backup format, and demo route behavior were kept intact.

## Recommendation

v0.9.2 is live and should be kept. The only follow-up needed is to retry pushing the rollback tag when GitHub HTTPS connectivity is stable.
