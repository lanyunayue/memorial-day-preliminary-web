# 时刻 v0.8.0 时刻精灵干净候选报告

## 1. 本轮目标

从 v0.7.4 线上基线 `6caac1249c30356fcc3fc0b7d84261c95d3d771f` 新建干净候选分支，只承接“时刻精灵”轻量助手和必要发布门禁，不把此前 34 个复赛集成提交一起带入。

## 2. 分支与基线

- Worktree：`D:\lifetime-v080-time-sprite-clean`
- 分支：`rematch-v080-time-sprite-clean`
- 基线：`main` / `origin/main` = `6caac1249c30356fcc3fc0b7d84261c95d3d771f`
- 候选版本：`v0.8.0`
- 部署状态：未 push / 未 deploy / 未 merge main / 未改 gh-pages

## 3. 修改文件

- `index.html`
  - 新增“时刻精灵”浮动入口和面板。
  - 新增精灵样式，手机默认收起，桌面默认展开。
  - 新增四语言精灵文案。
  - 新增精灵折叠状态本地保存。
  - 精灵可提示一句话输入、体验示例、今日数量和最近时刻。
  - 更新 `APP_VERSION` 为 `v0.8.0`。
  - 补充低风险可访问性和 i18n 缺口：日历前后按钮、重播开场按钮、动态置顶按钮 aria-label，`theme` / `storageError` / `mon_fmt` 文案。
- `manifest.json`
  - 将 `background_color` / `theme_color` 同步为默认主题色 `#f7f3ed`。
- `sw.js`
  - 更新 cache：`shike-v080-v26`。
- `scripts/test-shike-time-sprite.js`
  - 新增时刻精灵专项测试。
- `scripts/test-shike-regression-suite.js`
  - clean 候选测试入口，当前运行 7 项低耦合门禁。
- `scripts/test-shike-html-integrity.js`
- `scripts/test-shike-a11y-static.js`
- `scripts/test-shike-demo-examples.js`
- `scripts/test-shike-responsive-css.js`
- `scripts/test-shike-pwa-assets.js`
- `scripts/test-shike-i18n-placeholders.js`
- `docs/day-work/rematch-time-sprite-report.md`
  - 本报告。

## 4. 重要实现边界

- 没有引入此前集成分支中的 ICS、备份加固、通知重复修复、月重复修复、安全转义等其他产品提交。
- 没有改 NLP parser。
- 没有改日历核心逻辑。
- 没有改天气逻辑。
- 没有改备份导入导出逻辑。
- 没有改主题体系。
- 没有改主响应式布局。
- 没有新增外部依赖。

## 5. 干净候选修正

初次迁移时，精灵代码引用了集成分支里的 `getUpcomingRecordDateTime()` 和 `recordOccursOnDate()`。v0.7.4 基线没有这两个函数。

已修正为：

- 精灵内部使用 `getTimeSpriteRecordDate()`。
- 该 helper 只调用 v0.7.4 已存在的 `getRecordTargetDateTime()`。
- 今日计数只用于精灵摘要，不改变日历、通知或保存逻辑。

本轮发布门禁补强还修复了 v0.7.4 基线上已有的静态质量缺口：

- `calPrev` / `calNext` / `replayBtn` 增加 `aria-label`。
- 记录卡片动态置顶按钮增加 `aria-label`。
- 四语言字典补充 `theme` / `storageError`。
- 英文、日文字典补充 `mon_fmt`。
- manifest 颜色与默认 app 背景对齐。

## 6. 自动测试

已运行：

```bash
node D:\lifetime-v080-time-sprite-clean\scripts\test-shike-regression-suite.js
```

结果：

```text
Shike clean candidate suite: 7/7 passed
```

包含：

- PWA assets：8/8
- HTML integrity：7/7
- A11y static：6/6
- Demo examples：6/6
- Time sprite：8/8
- Responsive CSS：9/9
- I18N placeholders：6/6

单项复核：

```bash
node D:\lifetime-v080-time-sprite-clean\scripts\test-shike-time-sprite.js
```

结果：

```text
Time sprite regression passed: 8/8
```

说明：

- 本 clean 候选没有携带完整 26 项复赛集成测试套件。
- NLP parser 未修改；本候选通过 diff 范围控制来证明未触碰 parser。
- Demo examples 测试已按 clean 候选范围调整：验证示例数据、搜索/筛选可见性和日历 dateKey，不要求 `.ics` 导出。

## 7. 运行态视口验收

本地启动：

- `http://127.0.0.1:8103/`
- Headless Edge CDP

检查视口：

- `375 x 812`
- `1366 x 900`

每个视口检查：

- 首页可打开。
- 体验示例可生成 5 条记录。
- 首页输入区存在。
- 全部页搜索“妈妈”能显示“妈妈生日”。
- 日历页有 dot。
- 日历快速添加输入框存在。
- 我的页统计、天气开关、版本号存在。
- `replayBtn` 有 aria-label。
- 无横向溢出。
- 底部导航可见。
- 时刻精灵不越界。

结果：

```text
Clean candidate release gate passed: 2 viewports x 4 pages
```

## 8. 发布判断

这个分支比 `rematch-time-sprite` 更适合作为“只上线时刻精灵”的 v0.8.0 候选。

当前判断：

- 可以继续进入正式部署准备。
- 不建议直接部署此前 `rematch-time-sprite` 集成分支。
- 如果要上线 v0.8.0，建议以后续步骤在此 clean 分支基础上生成正式部署报告，再合并 main / 同步 gh-pages。

仍需注意：

- 不包含此前复赛工程加固提交。
- 不包含完整 26 项集成回归套件。
- NLP 没改，但本 clean 候选未携带 NLP 102/104 用例脚本。

## 9. 回滚方式

如果未部署：

```bash
git worktree remove D:\lifetime-v080-time-sprite-clean
git branch -D rematch-v080-time-sprite-clean
```

如果未来部署后需要回滚：

```bash
git switch main
git revert <v0.8.0-time-sprite-clean-release-commit>
git push origin main
# 再同步 gh-pages 回稳定版本
```

稳定线上回滚点：

```text
6caac1249c30356fcc3fc0b7d84261c95d3d771f
```
