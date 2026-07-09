# Shike v0.9.0 Deploy Report

Date: 2026-07-09
Main repo: E:\lifetime-web
Live URL: https://lanyunayue.github.io/memorial-day-preliminary-web/

## Commits

- Stable rollback tag: `shike-web-stable-before-v090-demo-mode`
- Rollback tag target: `c19e852b0df6056e133153c991c8aeec9aa4b06c`
- Startup audit commit: `d0b0530`
- v0.9.0 feature commit: `8d3f14e33e6bdb0cc0f415b6989d718f98cbfbf5`

## Pages Source

- GitHub Pages API `/pages` returned 404 without auth.
- Remote branch comparison showed `origin/main` was v0.8.9 and `origin/gh-pages` was v0.8.0 before deploy.
- Live site before deploy was v0.8.9, so Pages source was determined by content to be `main`.
- `gh-pages` was not updated or force-pushed.

## Local Main Verification

- `node scripts\test-shike-regression-suite.js`: passed, 26/26.
- `node scripts\test-shike-demo-route.js`: passed, 18/18.
- `node scripts\test-shike-runtime-cdp.js` against `http://127.0.0.1:8091/index.html`: passed, 9/9.

## Deploy Verification

- `git push origin main`: succeeded.
- GitHub Pages workflow run: `29019940337`.
- Workflow head SHA: `8d3f14e33e6bdb0cc0f415b6989d718f98cbfbf5`.
- Workflow conclusion: success.
- Root URL HTTP status: 200.
- Root URL contains `APP_VERSION='v0.9.0'`.
- Root URL contains `演示路线`.
- Root URL contains five steps: 一句话创建, 批量整理, 去重保护, 接入日历, 数据安全.
- Live `sw.js` contains `shike-v090-v36`.
- Live Edge CDP acceptance against the root URL: passed, 9/9.

## Implemented v0.9.0 Features

- Lightweight collapsed-by-default demo route on Home near today overview.
- LocalStorage route state key: `shike_demo_route_collapsed`.
- Sentence demo fills `明天下午三点开会` and opens parse preview without saving.
- Batch demo fills four example lines and prepares drafts without saving.
- Duplicate-protection step explains batch/internal and existing-record safeguards.
- Calendar step points to manual `.ics` export for Google Calendar, Apple Calendar, or Outlook import.
- Data safety step points to browser-local data and JSON backups.
- My page keeps a secondary route entry.

## Guardrails

- No cloud sync.
- No login.
- No database.
- No Google Calendar API.
- No LLM API.
- No parser rewrite.
- No UI rewrite.
- No v0.9.1 work.
- No changes under `E:\lifetime`.

## Follow-Up Check List

1. Home: route entry is visible but collapsed by default.
2. Home: "填入示例" fills the input and opens parse preview only.
3. Import: "打开批量整理" fills drafts but does not save.
4. My: calendar export and data safety jumps land in the correct sections.
5. Mobile: 375 / 390 / 414 widths do not horizontally overflow.
6. Live root URL keeps v0.9.0 without adding a `?v` parameter.
