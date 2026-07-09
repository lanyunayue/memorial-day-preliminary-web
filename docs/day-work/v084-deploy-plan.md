# 时刻 v0.8.4 Smart Capture 部署计划

## 当前线上版本

- 线上版本：v0.8.3
- 线上地址：https://lanyunayue.github.io/memorial-day-preliminary-web/
- main 当前基线：6d9a8e09ad8fea6923567e486020114ee4c8004e

## 候选版本

- 候选版本：v0.8.4
- 候选分支：rematch-v084-smart-capture
- 候选工作区：D:\lifetime-v084-smart-capture
- 实现 commit：3adfc73ebd694e01faf3b81a3e42cc17622e3634

## 上线前备份 tag

计划创建：

```powershell
git tag shike-web-stable-before-v084-smart-capture 6d9a8e09ad8fea6923567e486020114ee4c8004e
git push origin shike-web-stable-before-v084-smart-capture
```

## 部署步骤

```powershell
cd D:\lifetime
git switch main
git status
git merge --ff-only rematch-v084-smart-capture
node scripts/test-shike-regression-suite.js
node scripts/test-shike-time-sprite.js
node scripts/test-shike-backup-hardening.js
node scripts/test-shike-ics-export.js
node scripts/test-shike-ics-deep.js
git push origin main
```

GitHub Pages 当前从 main 发布，因此不直接修改 gh-pages。

## 上线后验证

1. 打开正式地址，不带 ?v 参数。
2. 确认页面版本为 v0.8.4。
3. 确认 sw.js 包含 shike-v084-v30。
4. 375px 检查首页、示例短句、解析预览、底部导航。
5. 1366px 检查桌面宽屏无横向溢出。
6. 输入“明天下午三点开会”，确认预览后保存。
7. 全部页搜索“开会”可找到记录。
8. 日历页有 dot。
9. 输入“随便记个想法”，确认进入稍后整理。
10. 稍后整理“设为明天”可用。
11. 体验示例、保存卡片、我的页语言 / 天气 / 备份仍可见。

## 回滚计划

若线上异常：

```powershell
cd D:\lifetime
git switch main
git reset --hard shike-web-stable-before-v084-smart-capture
git push origin main --force-with-lease
```

回滚后重新验证正式地址恢复到 v0.8.3。
