# v0.8.2 部署计划

## 1. 当前线上状态

- 当前线上版本：v0.8.0
- 当前线上地址：`https://lanyunayue.github.io/memorial-day-preliminary-web/`
- v0.8.1：未部署，但作为 v0.8.2 的本地基线
- v0.8.2 候选分支：`rematch-v082-rematch-competitiveness`

## 2. 候选版本

- 候选版本：v0.8.2
- 基线 commit：`5379870d682482f6b8b92de4a344d7a68e16ad1e`
- v0.8.2 包含 v0.8.1 的 foundation 能力：
  - `.ics` 导出
  - JSON 备份增强
  - 导入安全
  - 回归测试

## 3. 部署前 tag 建议

部署前建议给当前线上稳定状态打 tag：

```bash
git switch main
git tag shike-web-stable-before-v082-competitiveness
```

## 4. 合并策略

推荐策略：可以直接部署 v0.8.2，不必先部署 v0.8.1，因为 v0.8.2 已经包含 v0.8.1 的全部 foundation 能力。

合并方式：

```bash
git switch main
git merge --no-ff rematch-v082-rematch-competitiveness
git push origin main
```

如果用户希望更细粒度审计，也可以先 push 候选分支：

```bash
git push origin rematch-v082-rematch-competitiveness
```

## 5. gh-pages

需要同步 `gh-pages`，但必须等用户确认后执行。

同步后应确认：

- `index.html` 显示 v0.8.2。
- `sw.js` cache 为 `shike-v082-v28`。
- `manifest.json` 没有无关修改。
- 线上根地址不带 `?v=` 参数也能正常更新。

## 6. 部署后验证清单

正式地址：

`https://lanyunayue.github.io/memorial-day-preliminary-web/`

验证：

- [ ] 首页不白屏。
- [ ] 我的页版本号为 v0.8.2。
- [ ] 体验示例生成 5 条。
- [ ] 全部页搜索“妈妈”可找到妈妈生日。
- [ ] 日历页 dot 可见。
- [ ] 我的页“日历导出”可见。
- [ ] `.ics` 批量导出可下载。
- [ ] 单条记录详情可导出 `.ics`。
- [ ] 我的页“数据安全”可见。
- [ ] JSON 备份可下载。
- [ ] JSON 导入前出现预览。
- [ ] 取消导入不写入。
- [ ] 确认导入才写入。
- [ ] 提醒说明可见，且没有夸大后台提醒能力。
- [ ] 375 / 390 / 414 无横向溢出。
- [ ] 1366 / 1440 桌面端正常。
- [ ] 时刻精灵不遮挡输入框和底部导航。
- [ ] Service worker 更新到 `shike-v082-v28`。

## 7. 回滚到 v0.8.0

如果部署后出现严重问题：

```bash
git switch main
git reset --hard shike-web-stable-before-v082-competitiveness
git push origin main --force-with-lease
```

随后将 `gh-pages` 同步回 v0.8.0 对应内容。

## 8. 是否需要先部署 v0.8.1

不需要。v0.8.2 是从 v0.8.1 候选继续开发，已包含 v0.8.1 的 `.ics`、备份增强和导入安全能力。

## 9. 禁止自动部署

本计划只是部署路径说明。当前没有 push、没有 deploy、没有 merge main。必须等用户明确确认后再上线。
