# 时刻 v0.8.8 Batch Draft Dedupe 候选报告

## 结论

v0.8.8 完成“批量草稿去重”：用户粘贴多行事项时，完全重复的行只保留第一条草稿，避免保存全部后生成重复记录。

这是 v0.8.6 批量整理和 v0.8.7 草稿修改回流之后的数据质量增强，不改 UI 风格，不改 parser。

## 工作区

E:\lifetime-web-v088-batch-dedupe

## 分支

rematch-v088-batch-dedupe

## 基线

rematch-v087-draft-edit-handoff：

b123147348ecb2b9bde81d5565fe95f7c6cc8471

说明：v0.8.7 尚未部署，因为 GitHub Git HTTPS/TLS 通道不稳定。本 v0.8.8 是本地候选，暂不部署。

## 实现 commit

bfa69b2ed58b6a641bcb0fe5d796af0467ba5ea0

## 版本

- APP_VERSION：v0.8.8
- APP_UPDATED_AT：2026-07-09 13:34
- sw.js cache：shike-v088-v34

## 修改文件

- index.html
- sw.js
- scripts/test-shike-backup-hardening.js
- scripts/test-shike-batch-dedupe.js
- scripts/test-shike-regression-suite.js
- scripts/test-shike-time-sprite.js

## 用户可见变化

批量输入中如果出现重复行，例如：

```text
明天下午三点开会
明天下午三点开会
每月15号还信用卡
每月15号还信用卡
随便记个想法
```

整理页只生成 3 条唯一草稿：

- 开会
- 还信用卡
- 想法

## 实现范围

新增：

- getBatchDraftKey

修改：

- prepareBatchCaptureDrafts 内部按规范化后的行文本去重。

去重规则：

- trim 首尾空白。
- 合并连续空白。
- 转小写。
- 保留第一次出现的行。

## 不变项

- 不改 parser。
- 不改 NLP 规则。
- 不改已保存 records。
- 不改 UI 主题。
- 不改响应式。
- 不改体验示例。
- 不引入后端、登录、云同步、数据库或外部 API。

## 测试命令

```powershell
node scripts/test-shike-batch-dedupe.js
node scripts/test-shike-draft-edit-handoff.js
node scripts/test-shike-batch-capture-inbox.js
node scripts/test-shike-time-sprite.js
node scripts/test-shike-backup-hardening.js
node scripts/test-shike-regression-suite.js
```

## 测试结果

- Batch dedupe：6/6 通过
- Draft edit handoff：6/6 通过
- Batch capture inbox：8/8 通过
- Time sprite：8/8 通过
- Backup hardening：11/11 通过
- Clean candidate suite：24/24 通过

## 本地浏览器验收

Headless Edge 本地验收：14/14 通过。

覆盖：

- v0.8.8 加载
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

## 是否 push

否。

## 是否 deploy

否。

## 是否 merge main

否。

## 风险

风险较低。改动只作用于批量草稿生成阶段，且只去掉完全重复的输入行。

需要注意：如果用户故意输入两条完全相同的事项，本版本会只保留一条草稿。

## 后续建议

等 GitHub Git HTTPS/TLS 通道恢复后，先按顺序部署 v0.8.7，再决定是否把 v0.8.8 rebase 到已上线 main 并部署。
