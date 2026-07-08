# v0.8.1 部署计划

## 1. 目标

- 线上地址：`https://lanyunayue.github.io/memorial-day-preliminary-web/`
- 当前线上版本：v0.8.0
- 候选版本：v0.8.1
- 候选分支：`rematch-v081-foundation-candidate`

## 2. 部署前 tag 建议

在部署前给当前稳定线上版本打 tag：

```bash
git switch main
git tag shike-web-stable-before-v081-foundation
```

## 3. 需要 push 的分支

用户确认后，建议流程：

```bash
git switch main
git merge --no-ff rematch-v081-foundation-candidate
git push origin main
```

如果用户要求先保留候选分支远端备份，可先 push：

```bash
git push origin rematch-v081-foundation-candidate
```

## 4. gh-pages

需要同步 `gh-pages`，但必须等用户确认后执行。不要自动部署。

部署时应确保：

- `index.html` 为 v0.8.1。
- `sw.js` cache 为 `shike-v081-v27`。
- `manifest.json` 不被无关修改。
- `gh-pages` 根目录文件与 v0.8.1 候选一致。

## 5. 部署后验证清单

正式地址使用：

`https://lanyunayue.github.io/memorial-day-preliminary-web/`

不要把 `?v=` 参数作为正式验收地址。

验证：

- [ ] 首页正常打开，不白屏。
- [ ] 版本号显示 v0.8.1。
- [ ] 体验示例仍可生成 5 条。
- [ ] 全部页搜索“妈妈”能找到妈妈生日。
- [ ] 日历页 dot 正常。
- [ ] 我的页出现“日历导出”。
- [ ] “导出全部日历文件”能下载 `.ics`。
- [ ] 记录详情“导出日历”能下载单条 `.ics`。
- [ ] 整理页“导出数据”能下载带元数据 JSON。
- [ ] 坏 JSON 导入不会清空数据。
- [ ] 375 / 414 无横向溢出。
- [ ] 1366 / 1440 不是手机窄条。
- [ ] 时刻精灵不遮挡输入框和底部导航。
- [ ] PWA service worker 更新到 `shike-v081-v27`。

## 6. 回滚步骤

如果部署后发现严重问题：

```bash
git switch main
git reset --hard shike-web-stable-before-v081-foundation
git push origin main --force-with-lease
```

然后同步 `gh-pages` 回 v0.8.0 对应内容。

如果已经创建 v0.8.1 tag 或 release，需要在报告里记录撤回原因。

## 7. 禁止自动部署

本计划只说明可部署路径。当前候选未 push、未 deploy、未 merge main，必须等用户明确回复后再执行。
