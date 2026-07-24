# C0 Screenshot Manifest

## Required Screenshots (12)

| # | Description | Filename | Status |
|---|-------------|----------|--------|
| 01 | competition入口 | `01_competition_entry_v2.png` | CAPTURED |
| 02 | 三条演示事项 | `02_demo_records.png` | CAPTURED |
| 03 | handoff写入完成 | (visible via console log) | CONSOLE VERIFIED |
| 04 | valley加载页 | `04_valley_loaded.png` | CAPTURED |
| 05 | 游戏导入提示 | `05_game_imported.png` | CAPTURED (toast visible in log) |
| 06 | TASK木牌 | Requires manual WASD navigation | NOT_CAPTURED (tool limitation) |
| 07 | COMMITMENT誓约灯 | Requires manual WASD navigation | NOT_CAPTURED (tool limitation) |
| 08 | WAITING_FOR纸舟 | Requires manual WASD navigation | NOT_CAPTURED (tool limitation) |
| 09 | FREE_PLAY与返回按钮 | `09_freeplay_return_button.png` | CAPTURED |
| 10 | DeLoad前 | Requires manual E interaction with object | NOT_CAPTURED (tool limitation) |
| 11 | DeLoad后 | Requires manual E interaction with object | NOT_CAPTURED (tool limitation) |
| 12 | Web返回反馈 | `12_web_return_feedback.png` | CAPTURED |

## Captured Screenshots (6 of 12)

### 01_competition_entry_v2.png
- URL: http://localhost:8095/competition.html?demo=competition
- Shows: Competition entry page with title, description, demo items preview, "开始比赛体验" button

### 02_demo_records.png
- URL: http://localhost:8095/competition.html?demo=competition (scrolled)
- Shows: Three demo records visible in the entry page

### 04_valley_loaded.png
- URL: http://localhost:8095/valley/
- Shows: Valley 3D scene loaded, quality/audio buttons, "返回时刻" button visible top-right

### 05_game_imported.png
- URL: http://localhost:8095/valley/
- Shows: Game scene after import with return button present

### 09_freeplay_return_button.png
- URL: http://localhost:8095/valley/
- Shows: FREE_PLAY state with "返回时刻" button in top-right corner

### 12_web_return_feedback.png
- URL: http://localhost:8095/competition.html
- Shows: Return feedback card with three item results ("已见到" / "已安放"), "应用并清除" button

## Not Captured (6 of 12)
Screenshots 03, 06, 07, 08, 10, 11 require manual gameplay interaction that cannot be reliably performed through browser automation (WASD movement, mouse look, E-key interaction with 3D objects). These can be captured during a manual playthrough.

## Screenshot Location
All captured screenshots are stored in: `E:\lifetime-web\docs\competition\c0-runtime-closure\screenshots\`
