# Shike v0.8.3 Deploy Report

Date: 2026-07-09

## 1. Result

Deployment result: failed before remote update.

Reason: local Git could not connect to `github.com:443` for `git push`.

No online deployment was completed.

## 2. Candidate

- Worktree: `D:\lifetime-v083-visible-feature-pack`
- Branch: `rematch-v083-visible-feature-pack`
- Candidate HEAD before deploy attempt: `5f60f7e43d85836909fa1cedced6408c30091aee`
- Version: `v0.8.3`
- Service worker cache: `shike-v083-v29`

## 3. Predeploy Audit

Predeploy audit passed:

- branch: `rematch-v083-visible-feature-pack`
- HEAD: `5f60f7e43d85836909fa1cedced6408c30091aee`
- base: `0e1a5a90a6fff1c0016e483490e97d049c9ab0cf`
- no uncommitted changes in the candidate worktree

## 4. Predeploy Tests

Commands run:

```powershell
node scripts/test-shike-regression-suite.js
node scripts/test-shike-timeline.js
node scripts/test-shike-card-export.js
node scripts/test-shike-today-overview.js
node scripts/test-shike-time-sprite.js
node scripts/test-shike-ics-export.js
node scripts/test-shike-ics-deep.js
node scripts/test-shike-backup-hardening.js
node scripts/test-shike-data-safety-center.js
node scripts/test-shike-import-preview.js
node scripts/test-shike-pwa-notice.js
node scripts/test-shike-pwa-assets.js
```

Results:

- regression suite: 16/16
- timeline: 10/10
- card export: 10/10
- today overview: 8/8
- time sprite: 8/8
- `.ics` export: 11/11
- `.ics` deep: 14/14
- backup hardening: 11/11
- data safety center: 9/9
- import preview: 10/10
- PWA notice: 6/6
- PWA assets: 8/8

Full NLP script was not present, so no fresh NLP 104/104 result is claimed.

## 5. Runtime Validation

Local headless Edge validation passed:

- 375, 390, 414, 768, 1024, 1366, 1440 px
- no blank screen
- no horizontal overflow
- today overview visible
- time journey visible
- anniversary PNG export returns canvas
- time sprite works
- demo examples generate 5 records
- search works
- calendar dot visible
- import preview usable
- My page data safety, `.ics`, and PWA notice visible
- night theme readable
- desktop width is not phone-narrow
- no obvious JavaScript errors

Result: 26/26.

## 6. Deploy Attempt

The backup tag was created locally:

- `shike-web-stable-before-v083-visible-feature-pack`
- points to `0e1a5a90a6fff1c0016e483490e97d049c9ab0cf`

Pushing the tag failed:

```text
fatal: unable to access 'https://github.com/lanyunayue/memorial-day-preliminary-web.git/': Recv failure: Connection was reset
```

After local fast-forward merge, main tests passed, but pushing tag and main failed:

```text
fatal: unable to access 'https://github.com/lanyunayue/memorial-day-preliminary-web.git/': Failed to connect to github.com port 443 after 21029 ms: Couldn't connect to server
```

`Test-NetConnection github.com -Port 443` also failed with `TcpTestSucceeded: False`.

## 7. Rollback

Because deployment did not complete, local `main` was reset back to the local backup tag:

```powershell
git reset --hard shike-web-stable-before-v083-visible-feature-pack
```

Local `main` is back to:

- `0e1a5a90a6fff1c0016e483490e97d049c9ab0cf`
- version: `v0.8.2`
- service worker cache: `shike-v082-v28`

Online verification after failure:

- root URL HTTP 200
- online still contains `APP_VERSION='v0.8.2'`
- online does not contain `APP_VERSION='v0.8.3'`

## 8. v0.8.4 Status

v0.8.4 was not started because the instructions require v0.8.3 to be online successfully first.

## 9. Recommendation

Do not continue v0.8.4 until Git push connectivity is restored and v0.8.3 is deployed successfully.

Next safe step:

1. Restore GitHub HTTPS connectivity.
2. Re-run v0.8.3 deploy from `D:\lifetime-v083-visible-feature-pack`.
3. Confirm online `APP_VERSION='v0.8.3'`.
4. Only then create `D:\lifetime-v084-smart-capture`.

