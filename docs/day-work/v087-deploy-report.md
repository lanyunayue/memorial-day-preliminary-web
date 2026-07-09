# 时刻 v0.8.7 部署成功报告

## 结论

v0.8.7 draft edit handoff 已成功部署到 GitHub Pages。

正式地址：

https://lanyunayue.github.io/memorial-day-preliminary-web/

## 版本

- APP_VERSION：v0.8.7
- sw.js cache：shike-v087-v33

## main commit

b123147348ecb2b9bde81d5565fe95f7c6cc8471

## 备份 tag

上线前已创建并推送：

shike-web-stable-before-v087-draft-edit-handoff

该 tag 指向 v0.8.6 线上稳定点：

1f0a5a917860b3e399a160d15846252b22e5c1f2

## 本次功能

v0.8.7 增加批量草稿“修改”：

- 批量整理页每条草稿新增“修改”操作。
- 点击后该草稿从整理页移除。
- 页面回到首页。
- 首页输入框回填原始草稿文本。
- 自动打开解析预览。

## 上线前测试

在 E:\lifetime-web main 上执行：

```powershell
node scripts/test-shike-regression-suite.js
node scripts/test-shike-draft-edit-handoff.js
node scripts/test-shike-batch-capture-inbox.js
node scripts/test-shike-time-sprite.js
node scripts/test-shike-backup-hardening.js
node scripts/test-shike-ics-export.js
node scripts/test-shike-ics-deep.js
```

结果：

- Clean candidate suite：23/23 通过
- Draft edit handoff：6/6 通过
- Batch capture inbox：8/8 通过
- Time sprite：8/8 通过
- Backup hardening：11/11 通过
- ICS export：11/11 通过
- ICS deep：14/14 通过

## 线上验证

GitHub Pages root 和 sw.js 验证：

- root：v0.8.7
- sw.js：shike-v087-v33

线上 Headless Edge 验收：14/14 通过。

覆盖：

- v0.8.7 正式地址加载
- 375px 无横向溢出
- 批量输入生成 3 条草稿
- 每条草稿显示“修改”
- 点击第二条草稿修改后回到首页
- 输入框回填“每月15号还信用卡”
- 解析预览自动打开
- 未直接写入 records
- 整理页剩余 2 条草稿
- 1366px 无横向溢出
- 无明显 JavaScript 错误

## 回滚方式

如需回滚：

```powershell
cd E:\lifetime-web
git switch main
git reset --hard shike-web-stable-before-v087-draft-edit-handoff
git push origin main --force-with-lease
```

回滚后重新验证正式地址恢复 v0.8.6 / shike-v086-v32。

## 后续建议

v0.8.8 batch dedupe 已有本地候选，可在 v0.8.7 稳定后接入并部署。
