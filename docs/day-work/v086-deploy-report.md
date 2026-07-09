# 时刻 v0.8.6 部署成功报告

## 结论

v0.8.6 batch capture inbox 已成功部署到 GitHub Pages。

正式地址：

https://lanyunayue.github.io/memorial-day-preliminary-web/

## 版本

- APP_VERSION：v0.8.6
- sw.js cache：shike-v086-v32

## main commit

f9d14dc3db67c8e0f557f8ab5666d157b48bdaa1

## 备份 tag

上线前已创建并推送：

shike-web-stable-before-v086-batch-capture-inbox

该 tag 指向 v0.8.5 线上稳定点：

b26b2dfea206c996216ba36691b8fb26a44262b0

## 本次功能

v0.8.6 增加“批量录入收纳”：

- 首页输入框粘贴多行事项时，自动拆成多条草稿。
- 自动进入“整理”页复核。
- 用户可逐条保存 / 取消，或保存全部。
- 单行输入仍保持 v0.8.5 的解析预览和键盘确认。

## 上线前测试

在 E:\lifetime-web main 上执行：

```powershell
node scripts/test-shike-regression-suite.js
node scripts/test-shike-batch-capture-inbox.js
node scripts/test-shike-time-sprite.js
node scripts/test-shike-backup-hardening.js
node scripts/test-shike-ics-export.js
node scripts/test-shike-ics-deep.js
```

结果：

- Clean candidate suite：22/22 通过
- Batch capture inbox：8/8 通过
- Time sprite：8/8 通过
- Backup hardening：11/11 通过
- ICS export：11/11 通过
- ICS deep：14/14 通过

## 线上验证

GitHub Pages root 和 sw.js 验证：

- root：v0.8.6
- sw.js：shike-v086-v32

线上 Headless Edge 验收：15/15 通过。

覆盖：

- v0.8.6 正式地址加载
- 375px 无横向溢出
- 首页多行输入进入整理页
- 生成 3 条草稿
- 草稿包含开会、还信用卡、想法
- 进入草稿后未直接写入 records
- 保存全部后写入 3 条记录
- 保存后回到首页
- 单行输入仍出现解析预览
- 单行 Enter 仍确认保存
- 1366px 无横向溢出
- 无明显 JavaScript 错误

## 回滚方式

如需回滚：

```powershell
cd E:\lifetime-web
git switch main
git reset --hard shike-web-stable-before-v086-batch-capture-inbox
git push origin main --force-with-lease
```

回滚后重新验证正式地址恢复 v0.8.5 / shike-v085-v31。

## 后续建议

v0.8.6 已经把“单条智能录入”和“多行批量录入”串起来。下一轮应继续选择高收益但低侵入的主题，例如批量草稿的编辑能力或更强的草稿去重提示。
