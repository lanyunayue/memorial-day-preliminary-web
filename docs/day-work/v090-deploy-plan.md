# Shike v0.9.0 Deploy Plan

Date: 2026-07-09
Candidate branch: rematch-v090-rematch-demo-mode
Candidate worktree: E:\lifetime-web-v090-rematch-demo-mode
Main repo: E:\lifetime-web

## Pre-Deploy Gate

- Confirm candidate worktree tests are green.
- Confirm `index.html` has `APP_VERSION='v0.9.0'`.
- Confirm `sw.js` has `CACHE_NAME = 'shike-v090-v36'`.
- Confirm demo route strings are present.
- Confirm forbidden promises are absent: 自动同步, 绑定 Google Calendar, 云同步.
- Confirm no `E:\lifetime` changes.

## Deploy Steps

1. Commit candidate changes with message `build v090 demo route`.
2. In `E:\lifetime-web`, confirm current main is still based on `c19e852b0df6056e133153c991c8aeec9aa4b06c` or inspect any new upstream change before merging.
3. Create tag `shike-web-stable-before-v090-demo-mode` on the current online v0.8.9 stable main commit if it does not already exist.
4. Merge `rematch-v090-rematch-demo-mode` into main, preferably fast-forward.
5. Run key tests on main:
   - `node scripts\test-shike-regression-suite.js`
   - `node scripts\test-shike-demo-route.js`
   - `node scripts\test-shike-runtime-cdp.js` against local main server and Edge CDP.
6. Push main.
7. Determine GitHub Pages source before touching `gh-pages`.
8. If Pages source is main, do not force-push `gh-pages`.
9. If Pages source is `gh-pages`, update it from the verified main output using a non-destructive flow.
10. Verify live root URL without `?v`:
    - `https://lanyunayue.github.io/memorial-day-preliminary-web/`
11. Confirm live HTTP 200, `APP_VERSION='v0.9.0'`, `shike-v090-v36`, route title, five steps, route interactions, and no console errors.
12. If live verification fails, roll back main to `shike-web-stable-before-v090-demo-mode` and push the rollback.

## Rollback Trigger

Rollback if any of these fail after deploy:

- Root URL is not HTTP 200.
- Live HTML is not v0.9.0.
- Live service worker cache is not `shike-v090-v36`.
- Demo route is missing or route actions save/import/export automatically.
- Mobile viewports have horizontal overflow.
- There are new blocking JavaScript runtime errors.
