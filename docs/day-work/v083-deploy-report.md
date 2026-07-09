# Shike v0.8.3 Deploy Report

Date: 2026-07-09

## Result

Deployment result: success.

Online URL: `https://lanyunayue.github.io/memorial-day-preliminary-web/`

## Version

- Online app version: `v0.8.3`
- Service worker cache: `shike-v083-v29`
- Main deploy commit before this report update: `185d7f56f57de78b72f144a21c2d11d28be1a1aa`

## Backup Tag

Backup tag:

- `shike-web-stable-before-v083-visible-feature-pack`
- points to v0.8.2 stable commit `0e1a5a90a6fff1c0016e483490e97d049c9ab0cf`
- pushed to origin successfully

## Predeploy Tests

Commands run before push:

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

Full NLP script was not present, so this report does not claim a fresh NLP 104/104 result.

## Online Verification

Static online verification:

- root URL HTTP 200
- root HTML contains `APP_VERSION='v0.8.3'`
- `sw.js` contains `shike-v083-v29`

Headless Edge online verification:

- 375 px v0.8.3 visible: pass
- 375 px no horizontal overflow: pass
- 1366 px v0.8.3 visible: pass
- 1366 px no horizontal overflow: pass
- today overview visible: pass
- demo examples generate 5 records: pass
- time journey visible: pass
- anniversary card image entry visible: pass
- calendar dot visible: pass
- My page data safety, `.ics`, PWA notice visible: pass
- no obvious JavaScript runtime errors: pass

Result: 9/9.

## Notes

During the first deploy attempt, local Git connectivity to `github.com:443` failed. After connectivity recovered, the tag and main push succeeded. No rollback was needed for the successful deployment.

## Rollback

If v0.8.3 needs rollback:

```powershell
git switch main
git reset --hard shike-web-stable-before-v083-visible-feature-pack
git push --force-with-lease origin main
```

Then verify the root URL returns v0.8.2 and `sw.js` returns `shike-v082-v28`.

