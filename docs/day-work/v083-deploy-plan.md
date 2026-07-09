# Shike v0.8.3 Deploy Plan

## 1. 当前线上版本

当前线上版本：v0.8.2

线上地址：`https://lanyunayue.github.io/memorial-day-preliminary-web/`

## 2. 候选版本

候选版本：v0.8.3

候选分支：`rematch-v083-visible-feature-pack`

候选 worktree：`D:\lifetime-v083-visible-feature-pack`

## 3. 部署前 tag

部署前必须先从当前稳定 main 打 tag：

```powershell
git tag shike-web-stable-before-v083-visible-feature-pack main
git push origin shike-web-stable-before-v083-visible-feature-pack
```

## 4. 是否需要同步 gh-pages

需要视 GitHub Pages 当前 source 决定。

本地已知：v0.8.2 线上在 main push 后已经生效，gh-pages 分支上次推送曾遇到 GitHub HTTPS SSL 错误。因此部署 v0.8.3 前应先确认 Pages source。如果 Pages 使用 main，推 main 后等待 Pages 生效即可；如果 Pages 使用 gh-pages，需要同步并推送 gh-pages。

## 5. 部署前验证清单

- [ ] `APP_VERSION` 是 `v0.8.3`
- [ ] `sw.js` cache 是 `shike-v083-v29`
- [ ] `node scripts/test-shike-regression-suite.js` 通过
- [ ] `node scripts/test-shike-timeline.js` 通过
- [ ] `node scripts/test-shike-card-export.js` 通过
- [ ] `node scripts/test-shike-today-overview.js` 通过
- [ ] 本地 Edge 运行验收通过
- [ ] 未混入旧 `rematch-time-sprite` 大分支
- [ ] 未接云同步、登录、数据库、Google Calendar API 或大模型 API

## 6. 部署后验证清单

- [ ] 根地址 HTTP 200
- [ ] 根地址显示 v0.8.3
- [ ] `sw.js` 包含 `shike-v083-v29`
- [ ] 首页今日概览可见但不遮挡输入框
- [ ] 全部页时间旅程线可见，原列表仍可用
- [ ] 纪念日卡片 PNG 导出入口存在
- [ ] 体验示例仍生成 5 条
- [ ] 搜索筛选仍可用
- [ ] 日历 dot 仍可见
- [ ] `.ics` 导出仍可见
- [ ] 数据安全中心仍可见
- [ ] 导入预览仍可用
- [ ] 375px 和 1366px 无横向溢出

## 7. 回滚方式

如果部署后发现问题：

```powershell
git switch main
git reset --hard shike-web-stable-before-v083-visible-feature-pack
git push --force-with-lease origin main
```

如果 gh-pages 已同步，也需要将 gh-pages 回滚到部署前状态并重新推送。

## 8. 自动部署限制

本轮不允许自动部署。必须等用户确认后，再上线 v0.8.3。

