# 时刻 v0.8.7 Draft Edit Handoff 候选报告

## 结论

v0.8.7 完成“批量草稿修改回流”：用户在 v0.8.6 的批量整理页中，可以把任意一条草稿送回首页输入框继续修改，并自动打开解析预览。

这个改动补齐了批量录入后的纠错闭环，保持现有风格，不新增复杂编辑面板。

## 工作区

E:\lifetime-web-v087-draft-edit-handoff

## 分支

rematch-v087-draft-edit-handoff

## 基线

E:\lifetime-web main：

1f0a5a917860b3e399a160d15846252b22e5c1f2

线上基线：

v0.8.6 / shike-v086-v32

## 实现 commit

52e563cb734880f6535c427bda6f2fc10e5c4f06

## 版本

- APP_VERSION：v0.8.7
- APP_UPDATED_AT：2026-07-09 13:06
- sw.js cache：shike-v087-v33

## 修改文件

- index.html
- sw.js
- scripts/test-shike-backup-hardening.js
- scripts/test-shike-draft-edit-handoff.js
- scripts/test-shike-regression-suite.js
- scripts/test-shike-time-sprite.js

## 用户可见变化

批量整理页的每条草稿新增“修改”操作。

点击后：

1. 当前草稿从整理页移除。
2. 页面回到首页。
3. 首页输入框回填该草稿原始文本。
4. 自动打开解析预览。
5. 用户可以继续用 v0.8.5 的纠错 chips / Enter 确认 / Ctrl+Enter 直存。

## 不变项

- 不改 parser。
- 不改 NLP 规则。
- 不改数据结构。
- 不改 UI 主题。
- 不改桌面响应式。
- 不改体验示例。
- 不引入后端、登录、云同步、数据库或外部 API。

## 测试命令

```powershell
node scripts/test-shike-draft-edit-handoff.js
node scripts/test-shike-batch-capture-inbox.js
node scripts/test-shike-time-sprite.js
node scripts/test-shike-backup-hardening.js
node scripts/test-shike-regression-suite.js
```

## 测试结果

- Draft edit handoff：6/6 通过
- Batch capture inbox：8/8 通过
- Time sprite：8/8 通过
- Backup hardening：11/11 通过
- Clean candidate suite：23/23 通过

## 本地浏览器验收

Headless Edge 本地验收：14/14 通过。

覆盖：

- v0.8.7 加载
- 375px 无横向溢出
- 多行输入进入整理页
- 生成 3 条草稿
- 每条草稿都有“修改”
- 点击第二条草稿“修改”后回到首页
- 输入框回填“每月15号还信用卡”
- 解析预览自动打开
- 未直接写入 records
- 整理页剩余 2 条草稿
- 1366px 无横向溢出
- 无明显 JavaScript 错误

## 风险

风险低。新增操作只作用于未保存草稿，不会修改已保存 records。保存 / 取消 / 保存全部的原路径保留。

## 是否建议上线

建议上线。v0.8.6 已解决“多行输入变草稿”，v0.8.7 解决“草稿发现不对时如何快速修改”，两者形成完整闭环。
