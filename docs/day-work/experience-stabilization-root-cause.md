# 时刻 v1.4.1 体验稳定性根因报告

## 基线

- 审计时间：2026-07-11
- 审计时本地 `main`：`63c81e5`，工作区有既有未提交内容，未触碰
- 审计时 `origin/main`：`7fc40e6396c8a2a72ff78ecc22be00a16da0e6cb`（v1.4.0）
- 审计时线上：v1.4.0，`shike-v140-v52`
- v1.2.0 产品提交 `3096180` 已在 main 历史中，数据模块线上 HTTP 200，部署报告存在
- 本轮工作区：`E:\lifetime-web-v141-experience-completion`
- 分支：`hotfix-v141-experience-completion`
- 产品提交：`889a10faa12c19813bef841ca0d10a91f67aad31`

## 首页顶部空白

原问题由多个因素叠加：浏览器自动恢复滚动、普通启动自动聚焦输入框、空状态垂直居中、开场和更新弹层关闭后未统一恢复滚动，以及顶部安全区归属不清。v1.3.1 已引入 `history.scrollRestoration='manual'`、移除启动自动聚焦、空状态顶部对齐、关闭弹层后滚动归零和单一 safe-area 补偿。本轮没有重新设计首页，而是用同一套真实 Edge CDP 在未修复的 v1.3.0 与当前 v1.4.1 上量化复核。

| 视口 | v1.3.0 首个有效内容 top | v1.4.1 首个有效内容 top | v1.3.0 输入框 top | v1.4.1 输入框 top |
| --- | ---: | ---: | ---: | ---: |
| 360x640 | 95.97px | 42px | 224.94px | 170.97px |
| 375x667 | 126.33px | 42px | 255.30px | 170.97px |
| 390x844 | 194.23px | 42px | 323.20px | 170.97px |
| 414x896 | 238.52px | 42px | 367.48px | 170.97px |
| 768x1024 | 293.02px | 42px | 421.98px | 170.97px |
| 1366x768 | 181.45px | 42px | 310.42px | 170.97px |
| 1440x900 | 228.80px | 42px | 357.77px | 170.97px |
| 1920x1080 | 311.95px | 42px | 440.92px | 170.97px |

当前九个视口的首页容器顶部留白均为 16px，`scrollY=0`，横向溢出为 0。375x667 的 PWA app 模式也得到 `standalone=true`、顶部留白 16px、输入框 top 170.97px。

safe-area 只由 `.app` 或有记录状态的 `.topbar` 补偿，`html/body` 不再叠加 padding。滚动归零只发生在启动完成、开场关闭、更新弹层关闭和明确切回首页时，不在用户正常滚动过程中反复执行。

## 精灵登记失败与确认不完整

原始失败来自旧路由仅识别少数句首命令，句尾的“帮我登记”无法命中。v1.3.1 已新增 `src/assistant/sprite-create-intent.js`，把创建意图归一化后复用现有 parser。

本轮真实运行又发现两个未闭环问题：

1. 明确创建请求进入通用 Agent 计划卡，只显示 `create_record / confirm`，没有展示事项、日期、时间和类型，也没有修改按钮。
2. “帮我记一下买牛奶”虽然被识别为无时间输入，现有 parser 默认结果仍把它显示成“今天 / 提醒”。

v1.4.1 在适配层把无日期请求规范为 `dateKey=null`、`recordKind=note`，并在 Agent UI 中从同一预览对象展示结构化字段。确认前、修改和取消均不写入；确认按钮立即锁定；保存成功必须等待本地优先持久化完成。

## 发布完整性问题

审计 v1.4.0 时还发现：

1. `page-watch` 被误嵌在精灵 `<details>` 内，关注页可能无法作为主页面显示。
2. `sw.js` precache 数组含字面量 `\n`，`node --check sw.js` 报语法错误。

v1.4.1 将关注页移回 `#app`，并修复 Service Worker JavaScript。两项均加入回归断言。

## 不变量

- `parseReminderText`：245 行，SHA-256 前后均为 `cf4b6edb748365c430955443844bd09e6719a745b5ceba9cc83e5270560d1897`
- `parser-adapter.js`：5 行，规范化换行 SHA-256 前后均为 `efbff968efd518e26970bac24ad35396df8482a32ba56011c6670167d58c4b58`
- IndexedDB schema、数据完整性模块和 local-first bridge 均无差异
- 未清空或迁移用户数据

