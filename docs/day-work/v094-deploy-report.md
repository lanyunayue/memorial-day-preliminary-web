# Shike v0.9.4 Deploy Report

Generated: 2026-07-10 01:45 +08:00

## 1. Release

- Version: `v0.9.4`
- Cache: `shike-v094-v40`
- Online URL: `https://lanyunayue.github.io/memorial-day-preliminary-web/`
- Main commit after product deploy: `00bec1e`
- Product candidate commit: `00bec1e`
- Rollback tag: `shike-web-stable-before-v094-my-page-priority`

## 2. Deployment Actions

- Confirmed `E:\lifetime-web` main was clean at `d340a26`.
- Created rollback tag `shike-web-stable-before-v094-my-page-priority` at `d340a26`.
- Fast-forward merged `origin/rematch-v094-my-page-priority` into main.
- Reran regression checks on main before push: 34/34 passed in 5015ms.
- Pushed rollback tag to GitHub.
- Pushed main to GitHub (d340a26..00bec1e).
- Verified GitHub Pages root URL.

## 3. Tests Before Push

Static regression on main:

```text
node scripts\test-shike-regression-suite.js
Shike clean candidate suite: 34/34 passed in 5015ms
```

Full auditable regression log: `docs/day-work/v094-regression-full.log` (70 lines).

Verification checklist confirmed before commit:
- ✅ v094-regression-full.log generated
- ✅ Log contains "My page priority"
- ✅ 34/34 passed (greater than 33/33)
- ✅ No failed tests
- ✅ No skipped tests

Structural audit on candidate: 29/29 passed.

Runtime Edge CDP on candidate (localhost:8765): verified personalization section first position, featured styling, 4 feature chips, version display, page navigation.

## 4. Online Verification

Root URL polling confirmed:

```text
Version: v0.9.4
SW Cache: shike-v094-v40
Contains personalizeSection: True
Contains setting-group-featured: True
Contains personalizeDesc: True
```

Online Edge CDP verification results:

- ✅ Page loads at https://lanyunayue.github.io/memorial-day-preliminary-web/
- ✅ Page title: "时刻 - 你的贴心记事助手"
- ✅ APP_VERSION = v0.9.4
- ✅ personalizeSection is group index 0 (first)
- ✅ First group has `setting-group-featured` class
- ✅ personalizeDesc text: "调整主题、语言和时刻精灵，让时刻更像你的助手。"
- ✅ All 4 feature chips present: 主题, 语言, 小精灵, 显示偏好
- ✅ Section order: 个性化 → 日历导出 → 数据安全

## 5. Product Changes in v0.9.4

- "个性化" section moved to the first position in "我的" page
- Added featured visual styling with subtle gradient background
- Added descriptive note about personalization options
- Added 4 feature chips highlighting customization categories
- Added 5 new i18n keys across all 4 supported languages
- Version bumped to v0.9.4, SW cache to shike-v094-v40
- New test suite: test-shike-my-page-priority.js (24 assertions)

## 6. Rollback

```text
git switch main
git reset --hard shike-web-stable-before-v094-my-page-priority
git push origin main --force-with-lease
```

## 7. Deploy Status

✅ **v0.9.4 deployed successfully.** All checks pass. No further action needed.
