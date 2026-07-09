# 时刻 v0.8.6 Batch Capture Inbox 候选报告

## 结论

v0.8.6 完成“批量录入收纳”候选：用户在首页输入框粘贴多行事项时，不再被当成一条长记录，而是自动拆成多条草稿并进入“整理”页复核。

这是对 v0.8.4 / v0.8.5 smart capture 的自然延伸，保持当前产品风格，不做后台化 UI。

## 工作区

E:\lifetime-web-v086-batch-capture-inbox

## 分支

rematch-v086-batch-capture-inbox

## 基线

E 盘 v0.8.5 tree 等价 main：

d80d1718776465a22092ff846802594373e3a766

该 commit 的 tree 与远端 v0.8.5 main b26b2dfea206c996216ba36691b8fb26a44262b0 相同：

67943c6745b264117caf38800ca0e92d979ca33a

## 实现 commit

60abe85411aa7064ca3459c7038b7085224b3eee

## 版本

- APP_VERSION：v0.8.6
- APP_UPDATED_AT：2026-07-09 12:24
- sw.js cache：shike-v086-v32

## 修改文件

- index.html
- sw.js
- scripts/test-shike-backup-hardening.js
- scripts/test-shike-batch-capture-inbox.js
- scripts/test-shike-regression-suite.js
- scripts/test-shike-time-sprite.js

## 用户可见变化

用户可以在首页输入框一次粘贴多行：

```text
明天下午三点开会
每月15号还信用卡
随便记个想法
```

按 Enter 后，时刻会：

1. 自动识别这是多行输入。
2. 将每一行解析成一条草稿。
3. 跳转到“整理”页。
4. 让用户逐条保存 / 取消，或一键保存全部。

单行输入仍保持 v0.8.5 的解析预览和键盘确认体验。

## 实现范围

新增小范围 helper：

- getBatchCaptureLines
- shouldUseBatchCapture
- prepareBatchCaptureDrafts
- captureBatchFromInput

复用既有能力：

- parseReminderText
- normalizeCapturePreviewParsed
- importDrafts
- renderDrafts
- saveAllDrafts

## 不变项

- 不改 parser 规则。
- 不改 NLP 解析核心。
- 不改 UI 主题。
- 不改桌面响应式。
- 不改体验示例。
- 不改天气、多语言、备份结构。
- 不引入后端、登录、云同步、数据库或外部 API。

## 测试命令

```powershell
node scripts/test-shike-batch-capture-inbox.js
node scripts/test-shike-time-sprite.js
node scripts/test-shike-backup-hardening.js
node scripts/test-shike-regression-suite.js
```

## 测试结果

- Batch capture inbox：8/8 通过
- Time sprite：8/8 通过
- Backup hardening：11/11 通过
- Clean candidate suite：22/22 通过

## 本地浏览器验收

Headless Edge 本地验收：15/15 通过。

覆盖：

- v0.8.6 加载
- 375px 无横向溢出
- 多行首页输入进入整理页
- 生成 3 条草稿
- 草稿包含开会、还信用卡、想法
- 进入草稿后未直接写入 records
- 输入框清空
- 保存全部后写入 3 条记录
- 保存后回到首页
- 单行输入仍出现解析预览
- 单行 Enter 仍确认保存
- 1366px 无横向溢出
- 无明显 JavaScript 错误

## 风险

风险较低。新增逻辑只在输入文本包含至少两条非空行时触发；单行输入路径仍保持 v0.8.5 行为。

已知注意：多行输入中的无效行会沿用既有批量整理逻辑被跳过，不会直接写入记录。

## 是否 push

否。

## 是否 deploy

否。

## 是否 merge main

否。

## 后续建议

可以保留该候选分支。若要上线，先解决 E 盘 main 与远端 b26b2df 的 Git 对象对齐问题，再创建上线前 tag、合并、测试、push、验证 GitHub Pages。
