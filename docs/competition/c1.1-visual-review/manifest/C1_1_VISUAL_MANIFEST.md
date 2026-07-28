# C1.1 Visual Review Manifest

## 概述

本清单记录 C1.1 评委首次体验打磨的所有视觉复核证据。

- **日期**: 2026-07-27
- **基线**: Game HEAD 88de9cb / Web HEAD 452a745
- **服务器**: http://127.0.0.1:8095 (local)
- **截图工具**: Playwright (Chromium headless)
- **Mock 截图数**: 0
- **Debug 强制截图数**: 0
- **缺失截图数**: 0

---

## 截图清单

### 01_home (首页)

| 文件名 | 分辨率 | URL | 操作步骤 | 真实流程 | Mock | Debug | 已知限制 |
|--------|--------|-----|----------|----------|------|-------|----------|
| before/01_home_before_1920.png | 1920x1080 | / | 打开首页 | 是 | 否 | 否 | C1.1前版本 |
| before/01_home_before_1366.png | 1366x768 | / | 打开首页 | 是 | 否 | 否 | C1.1前版本 |
| after/01_home_after_1920.png | 1920x1080 | / | 打开首页 | 是 | 否 | 否 | - |
| after/01_home_after_1366.png | 1366x768 | / | 打开首页 | 是 | 否 | 否 | - |

**首页首屏检查 (1366x768)**:
- 主标题底部位置: 137px (在首屏内)
- 副标题底部位置: 181px (在首屏内)
- 开始体验按钮: top=406, bottom=456 (在首屏内)
- 输入框顶部位置: 537px (在首屏内)
- 无横向滚动
- 主标题: 2行
- 副标题: 1行
- **状态: OK**

### 02_competition (比赛页)

| 文件名 | 分辨率 | URL | 操作步骤 | 真实流程 | Mock | Debug | 已知限制 |
|--------|--------|-----|----------|----------|------|-------|----------|
| before/02_competition_before_1920.png | 1920x1080 | /competition.html | 打开比赛页 | 是 | 否 | 否 | C1.1前版本 |
| before/02_competition_before_1366.png | 1366x768 | /competition.html | 打开比赛页 | 是 | 否 | 否 | C1.1前版本 |
| after/02_competition_after_1920.png | 1920x1080 | /competition.html | 打开比赛页 | 是 | 否 | 否 | - |
| after/02_competition_after_1366.png | 1366x768 | /competition.html | 打开比赛页 | 是 | 否 | 否 | - |

**比赛页首屏检查 (1366x768)**:
- 核心主张: 可见 (top=75, bottom=276)
- 三条事项: 3项存在，2项在首屏内
- 预计体验时间: 文本存在
- 开始体验按钮: top=847, bottom=897 (**超出首屏 768px**)
- **状态: COMPETITION_ABOVE_FOLD_FAILED**

### 03_game_intro (游戏介绍层)

| 文件名 | 分辨率 | URL | 操作步骤 | 真实流程 | Mock | Debug | 已知限制 |
|--------|--------|-----|----------|----------|------|-------|----------|
| before/03_game_intro_before_1920.png | 1920x1080 | /valley/ | 进入归时谷→等待加载→截取介绍层 | 是 | 否 | 否 | C1.1前版本 |
| before/03_game_intro_before_1366.png | 1366x768 | /valley/ | 同上 | 是 | 否 | 否 | C1.1前版本 |
| after/03_game_intro_after_1920.png | 1920x1080 | /valley/ | competition?demo→点击开始→等待加载→截取介绍层 | 是 | 否 | 否 | - |
| after/03_game_intro_after_1366.png | 1366x768 | /valley/ | 同上 | 是 | 否 | 否 | - |

### 04_task_focus (任务聚焦 - 拆分前)

| 文件名 | 分辨率 | URL | 操作步骤 | 真实流程 | Mock | Debug | 已知限制 |
|--------|--------|-----|----------|----------|------|-------|----------|
| before/04_task_focus_before_1920.png | 1920x1080 | /valley/ | 进入归时谷→比赛面板→TASK高亮 | 是 | 否 | 否 | C1.1前版本 |
| before/04_task_focus_before_1366.png | 1366x768 | /valley/ | 同上 | 是 | 否 | 否 | C1.1前版本 |
| after/04_task_focus_after_1920.png | 1920x1080 | /valley/ | 全新流程→进入归时谷→开始→面板出现→TASK高亮→拆分前截图 | 是 | 否 | 否 | - |
| after/04_task_focus_after_1366.png | 1366x768 | /valley/ | 同上 | 是 | 否 | 否 | - |

**验证**: 截图中不包含"已拆分"、"子任务"、"拆分成功"文字。面板显示3条未处理事项。

### 05_deload (DeLoad减负面板)

| 文件名 | 分辨率 | URL | 操作步骤 | 真实流程 | Mock | Debug | 已知限制 |
|--------|--------|-----|----------|----------|------|-------|----------|
| before/05_deload_before_1920.png | 1920x1080 | /valley/ | 打开DeLoad面板 | 是 | 否 | 否 | C1.1前版本 |
| before/05_deload_before_1366.png | 1366x768 | /valley/ | 同上 | 是 | 否 | 否 | C1.1前版本 |
| after/05_deload_after_1920.png | 1920x1080 | /valley/ | 全新流程→TASK点击→DeLoad打开→点击拆分→显示3个子步骤 | 是 | 否 | 否 | 截取拆分子面板 |
| after/05_deload_after_1366.png | 1366x768 | /valley/ | 同上 | 是 | 否 | 否 | 同上 |

**DeLoad可见性检查 (1366x768)**:
- 4个操作按钮全部存在: 延期、拆分(推荐)、今天不处理、放下
- 拆分子面板: 3个步骤可见，确认和返回按钮可见
- 拆分子面板底部: 537px (在首屏768px内)
- DeLoad主面板底部: 823px (超出首屏，但所有按钮可见)
- **状态: DELOAD_VISIBILITY_ISSUE** (主面板超出首屏，但所有交互按钮均可见)

### 06_world_response (世界反馈)

| 文件名 | 分辨率 | URL | 操作步骤 | 真实流程 | Mock | Debug | 已知限制 |
|--------|--------|-----|----------|----------|------|-------|----------|
| before/06_world_response_before_1920.png | 1920x1080 | /valley/ | DeLoad打开状态 | 是 | 否 | 否 | C1.1前版本 |
| before/06_world_response_before_1366.png | 1366x768 | /valley/ | 同上 | 是 | 否 | 否 | C1.1前版本 |
| after/06_world_before_1920.png | 1920x1080 | /valley/ | 拆分前世界状态 | 是 | 否 | 否 | - |
| after/06_world_before_1366.png | 1366x768 | /valley/ | 同上 | 是 | 否 | 否 | - |
| after/06_world_response_1s_1920.png | 1920x1080 | /valley/ | 拆分确认后1秒 | 是 | 否 | 否 | - |
| after/06_world_response_1s_1366.png | 1366x768 | /valley/ | 同上 | 是 | 否 | 否 | - |
| after/06_world_response_3s_1920.png | 1920x1080 | /valley/ | 拆分确认后3秒 | 是 | 否 | 否 | - |
| after/06_world_response_3s_1366.png | 1366x768 | /valley/ | 同上 | 是 | 否 | 否 | - |
| after/06_world_response_after_1920.png | 1920x1080 | /valley/ | 拆分确认后最终状态 | 是 | 否 | 否 | 同3s |
| after/06_world_response_after_1366.png | 1366x768 | /valley/ | 同上 | 是 | 否 | 否 | 同3s |

**世界反馈视觉分析**:

| 分辨率 | 拆分前亮度 | 1秒后亮度 | 3秒后亮度 | 亮度变化 | 暖光增量(R) | 像素差异 | 视觉变化 |
|--------|-----------|-----------|-----------|---------|------------|---------|---------|
| 1920 | 54 | 59 | 72 | +18 | +31 | 32.9 | 是 |
| 1366 | 49 | 56 | 70 | +21 | +33 | 34.03 | 是 |

**可辨认的视觉变化**:
1. 暖光明显增强 (R通道 +31/+33)
2. 整体亮度提升 (+18/+21)
3. 像素显著变化 (差异 32.9/34.03)
- **状态: 视觉变化已检测，非 WORLD_VISUAL_RESPONSE_TOO_SUBTLE**

### 07_return_result (返回结果页)

| 文件名 | 分辨率 | URL | 操作步骤 | 真实流程 | Mock | Debug | 已知限制 |
|--------|--------|-----|----------|----------|------|-------|----------|
| before/07_return_result_before_1920.png | 1920x1080 | /competition.html | 返回结果页 | 是 | 否 | 否 | C1.1前版本 |
| before/07_return_result_before_1366.png | 1366x768 | /competition.html | 同上 | 是 | 否 | 否 | C1.1前版本 |
| after/07_return_result_after_1920.png | 1920x1080 | /competition.html | 全新流程→开始体验→导入3条→TASK真实拆分→确认3子步骤→返回时刻→真实结果页 | 是 | 否 | 否 | - |
| after/07_return_result_after_1366.png | 1366x768 | /competition.html | 同上 | 是 | 否 | 否 | - |

**真实返回 Payload** (manifest/07_real_return_payload.json):
- action: split
- title: 完成比赛演示视频
- summary: 已拆分为3步
- children: 整理录制素材, 完成第一版剪辑, 导出并检查最终视频
- **禁止项检查**: 无localStorage手工注入、无DOM修改、无debug API伪造

---

## 对比图清单

| 文件名 | 分辨率 |
|--------|--------|
| comparison/01_home_comparison_1920.png | 1920x1080 |
| comparison/01_home_comparison_1366.png | 1366x768 |
| comparison/02_competition_comparison_1920.png | 1920x1080 |
| comparison/02_competition_comparison_1366.png | 1366x768 |
| comparison/03_game_intro_comparison_1920.png | 1920x1080 |
| comparison/03_game_intro_comparison_1366.png | 1366x768 |
| comparison/04_task_focus_comparison_1920.png | 1920x1080 |
| comparison/04_task_focus_comparison_1366.png | 1366x768 |
| comparison/05_deload_comparison_1920.png | 1920x1080 |
| comparison/05_deload_comparison_1366.png | 1366x768 |
| comparison/06_world_response_comparison_1920.png | 1920x1080 |
| comparison/06_world_response_comparison_1366.png | 1366x768 |
| comparison/07_return_result_comparison_1920.png | 1920x1080 |
| comparison/07_return_result_comparison_1366.png | 1366x768 |

---

## 验证文件清单

| 文件名 | 内容 |
|--------|------|
| manifest/home_first_screen_check.json | 首页首屏位置数据 |
| manifest/competition_above_fold_check.json | 比赛页首屏检查 |
| manifest/deload_visibility_check.json | DeLoad面板可见性检查 |
| manifest/world_response_analysis.json | 世界反馈像素级分析 |
| manifest/07_real_return_payload.json | 真实返回payload（脱敏） |

---

## 已知问题

1. **COMPETITION_ABOVE_FOLD_FAILED**: competition.html 在 1366x768 下，"开始体验"按钮位于首屏下方 (bottom=897 > 768)，需要滚动才能看到。
2. **DELOAD_VISIBILITY_ISSUE**: DeLoad主面板在 1366x768 下底部超出首屏 (bottom=823 > 768)，但所有4个操作按钮和返回按钮均可见。拆分子面板完全在首屏内 (bottom=537 < 768)。
3. **06_world_response**: 雾气退散效果在单帧截图中难以完全呈现，但通过 before/1s/3s 三帧对比和像素分析，暖光增强和亮度变化可量化验证。

---

## 最终统计

```
mock screenshots: 0
debug-forced screenshots: 0
missing screenshots: 0
total before: 14
total after: 20 (含06多帧)
total comparison: 14
total manifest files: 5
```
