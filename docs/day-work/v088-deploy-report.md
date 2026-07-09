# 时刻 v0.8.8 部署成功报告

## 结论

v0.8.8 batch draft dedupe 已成功部署到 GitHub Pages。

正式地址：

https://lanyunayue.github.io/memorial-day-preliminary-web/

## 版本

- APP_VERSION：v0.8.8
- sw.js cache：shike-v088-v34

## main commit

9e3300626239268b8472aabb0d61f20d08410f88

## 备份 tag

上线前已创建并推送：

shike-web-stable-before-v088-batch-dedupe

该 tag 指向 v0.8.7 线上稳定点：

90b0222fdebf61f3975de8ea76a02fa1575408a9

## 本次功能

v0.8.8 增加批量草稿去重：

- 批量输入中完全重复的行只生成一条草稿。
- 去重发生在解析前，避免重复 parser 工作。
- 保留第一次出现的行。
- v0.8.7 的草稿“修改”回流继续可用。

## 上线前测试

在 E:\lifetime-web main 上执行：

```powershell
node scripts/test-shike-regression-suite.js
node scripts/test-shike-batch-dedupe.js
node scripts/test-shike-draft-edit-handoff.js
node scripts/test-shike-batch-capture-inbox.js
node scripts/test-shike-time-sprite.js
node scripts/test-shike-backup-hardening.js
node scripts/test-shike-ics-export.js
node scripts/test-shike-ics-deep.js
```

结果：

- Clean candidate suite：24/24 通过
- Batch dedupe：6/6 通过
- Draft edit handoff：6/6 通过
- Batch capture inbox：8/8 通过
- Time sprite：8/8 通过
- Backup hardening：11/11 通过
- ICS export：11/11 通过
- ICS deep：14/14 通过

## 线上验证

GitHub Pages root 和 sw.js 验证：

- root：v0.8.8
- sw.js：shike-v088-v34

线上 Headless Edge 验收：14/14 通过。

覆盖：

- v0.8.8 正式地址加载
- 375px 无横向溢出
- 重复多行输入进入整理页
- 重复行折叠成 3 条唯一草稿
- 开会只出现一次
- 还信用卡只出现一次
- 想法保留
- 进入草稿后未直接写入 records
- 修改回流仍正常
- 1366px 无横向溢出
- 无明显 JavaScript 错误

## 回滚方式

如需回滚：

```powershell
cd E:\lifetime-web
git switch main
git reset --hard shike-web-stable-before-v088-batch-dedupe
git push origin main --force-with-lease
```

回滚后重新验证正式地址恢复 v0.8.7 / shike-v087-v33。

## 后续建议

下一轮可以继续围绕批量整理做高收益小主题，例如“草稿保存前冲突提示”或“批量草稿一键全选/清空”，但仍应保持小范围、可回滚、可测试。
