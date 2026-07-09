# Shike v0.8.3 Visible Feature Pack Report

## 1. 工作区

`D:\lifetime-v083-visible-feature-pack`

## 2. 分支

`rematch-v083-visible-feature-pack`

## 3. 基线 commit

`0e1a5a90a6fff1c0016e483490e97d049c9ab0cf`

基线为 v0.8.2 main。

## 4. 新 commit

实现 commit：

`5a4f1c9133c4f488e28de90c8bae7d27fd92d849`

主报告会作为后续本地报告 commit 提交。

## 5. 版本号

`APP_VERSION = v0.8.3`

`APP_UPDATED_AT = 2026-07-09 23:45`

`sw.js cache = shike-v083-v29`

## 6. 修改文件

- `index.html`
- `sw.js`
- `scripts/test-shike-backup-hardening.js`
- `scripts/test-shike-regression-suite.js`
- `scripts/test-shike-time-sprite.js`
- `scripts/test-shike-timeline.js`
- `scripts/test-shike-card-export.js`
- `scripts/test-shike-today-overview.js`
- `docs/day-work/v083-visible-feature-pack-demo-notes.md`
- `docs/day-work/v083-deploy-plan.md`
- `docs/day-work/rematch-v083-visible-feature-pack-report.md`

## 7. 新增功能

1. 今日概览：首页输入框下方轻量显示今天记录数、最近安排、最近纪念日。
2. 时间旅程线：全部页顶部按今天、明天、本周、未来、无日期分组，每组最多显示 3 条代表记录，原全部列表保留。
3. 纪念卡片 PNG 导出：纪念日卡片和详情抽屉提供“保存卡片”，使用本地 canvas 生成 PNG。

## 8. 用户可见变化

- 打开首页后能快速知道最近要关注什么。
- 进入全部页后能看到自己的时间流，而不是只有线性列表。
- 纪念日大卡片可以导出为图片，适合复赛演示和用户保存。

## 9. UI 风格检查

保持 v0.8.2 风格：

- 使用现有卡片、圆角、柔和边框、当前主题色和字体体系。
- 没有后台管理面板、表格化布局、游戏化系统或大面积新色彩。
- 新模块不遮挡主输入框，不遮挡底部导航。

## 10. 测试命令

```powershell
node scripts/test-shike-regression-suite.js
node scripts/test-shike-timeline.js
node scripts/test-shike-card-export.js
node scripts/test-shike-today-overview.js
node scripts/test-shike-backup-hardening.js
node scripts/test-shike-ics-export.js
node scripts/test-shike-ics-deep.js
```

## 11. 测试结果

- 总回归套件：16/16
- 时间旅程线：10/10
- 纪念卡片 PNG：10/10
- 今日概览：8/8
- 备份加固：11/11
- `.ics` 导出：11/11
- `.ics` deep：14/14

完整 NLP 脚本在当前 worktree 中不存在，因此本报告不声称 NLP 104/104。

## 12. 运行态验收

本地 headless Edge 运行验收：26/26。

覆盖：

- 375 / 390 / 414 / 768 / 1024 / 1366 / 1440
- 首页、全部、日历、整理、我的
- 今日概览
- 时间旅程线
- PNG 导出 canvas
- 时刻精灵
- 体验示例
- 搜索
- 日历 dot
- 导入预览
- `.ics` / 数据安全 / PWA 提醒说明
- 夜间主题
- 桌面宽度

## 13. 手机端检查

375、390、414 px 均通过：

- 页面不白屏
- 无横向溢出
- 今日概览位于输入框下方
- 底部导航未被遮挡

## 14. 桌面端检查

1024、1366、1440 px 均通过：

- 页面不白屏
- 无横向溢出
- 1366 px 下 `#app` 宽度约 1080 px，不是手机窄条
- 时间旅程线和全部列表在桌面端可读

## 15. 是否影响时刻精灵

未发现影响。运行态验证中时刻精灵可见、可展开、可收起。

## 16. 是否影响 .ics

未发现影响。`.ics` 导出测试 11/11，`.ics` deep 14/14。

## 17. 是否影响数据安全中心

未发现影响。我的页数据安全中心可见，相关静态测试仍通过。

## 18. 是否影响导入预览

未发现影响。整理页示例识别可生成 draft，导入预览测试 10/10。

## 19. 是否影响 PWA

未发现影响。PWA notice 6/6，PWA assets 8/8。service worker cache 已更新为 `shike-v083-v29`。

## 20. 是否 push

否。

## 21. 是否 deploy

否。

## 22. 是否 merge main

否。

## 23. 风险

最大风险是 PNG 导出在少数浏览器上可能受 canvas 能力限制。已提供降级提示：“当前浏览器暂不支持导出图片，可以截图保存。”

次要风险是新增模块增加首页和全部页信息密度，但本轮通过 375 px 与 1366 px 运行验收，未发现遮挡或横向溢出。

## 24. 回滚方式

当前分支未推送、未部署、未合并。回滚方式：

```powershell
git switch main
git worktree remove D:\lifetime-v083-visible-feature-pack
git branch -D rematch-v083-visible-feature-pack
```

如果未来已合并，则 revert v0.8.3 相关 commit，或回滚到部署前 tag `shike-web-stable-before-v083-visible-feature-pack`。

## 25. 是否建议部署 v0.8.3

建议在用户手动查看本地候选后，再部署 v0.8.3。

当前候选已经具备复赛展示价值，但本轮按要求不自动部署。

