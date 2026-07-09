# 时刻 v0.8.4 Smart Capture 候选报告

## 1. 工作区

D:\lifetime-v084-smart-capture

## 2. 分支

rematch-v084-smart-capture

## 3. 基线 commit

6d9a8e09ad8fea6923567e486020114ee4c8004e

基线为 v0.8.3 部署成功后的 main。

## 4. 新 commit

实现 commit：3adfc73ebd694e01faf3b81a3e42cc17622e3634

## 5. 版本

- APP_VERSION：v0.8.4
- APP_UPDATED_AT：2026-07-10 00:35
- sw.js cache：shike-v084-v30

## 6. 修改文件

- index.html
- sw.js
- scripts/test-shike-regression-suite.js
- scripts/test-shike-time-sprite.js
- scripts/test-shike-backup-hardening.js
- scripts/test-shike-parse-preview.js
- scripts/test-shike-correction-chips.js
- scripts/test-shike-later-inbox.js
- scripts/test-shike-example-chips.js

## 7. 解析预览

输入一句话后先展示解析预览，用户能看到类型、标题、日期、时间、重复规则、日历状态和 .ics 导出状态，再确认创建。

这降低了 NLP 解析黑盒感，不改变原有一句话录入风格。

## 8. 纠错 chips

预览中加入小范围纠错 chips：

- 类型：提醒、纪念、习惯、备忘
- 重复：不重复、每天、每月、每年
- 日期：保持解析结果、今天、明天、无日期
- 时间：保持解析结果、无时间、上午 9:00、下午 3:00、晚上 8:00

纠错只作用于当前待确认记录，不重写 parser。

## 9. 稍后整理

无日期备忘进入整理页的“稍后整理”区域。用户可以查看、设为今天、设为明天，或保持无日期。

本轮补了“想法 / 备忘 / 清单 / 灵感 / 笔记”等无明确日期内容的识别保护，避免被误落到今天。

## 10. 示例短句

首页加入 5 个示例短句：

- 明天下午三点开会
- 每月15号还信用卡
- 7月8日妈妈生日
- 每天睡前涂润唇膏
- 周末整理房间

点击示例短句只填入输入框并打开解析预览，不直接保存，不污染用户数据。

## 11. 用户可见变化

v0.8.4 让用户在保存前先确认“时刻理解成了什么”，并提供轻量纠错。新用户可以点示例短句快速理解能力边界；不确定日期的想法可以先收进稍后整理。

## 12. 测试命令

```powershell
node scripts/test-shike-regression-suite.js
node scripts/test-shike-parse-preview.js
node scripts/test-shike-correction-chips.js
node scripts/test-shike-later-inbox.js
node scripts/test-shike-example-chips.js
node scripts/test-shike-time-sprite.js
node scripts/test-shike-backup-hardening.js
node scripts/test-shike-ics-export.js
node scripts/test-shike-ics-deep.js
```

## 13. 测试结果

- clean candidate suite：20/20 通过
- parse preview：10/10 通过
- correction chips：10/10 通过
- later inbox：10/10 通过
- example chips：7/7 通过
- time sprite：8/8 通过
- backup hardening：11/11 通过
- ICS export：11/11 通过
- ICS deep：14/14 通过

## 14. 本地运行时验收

Headless Edge 本地验收：18/18 通过。

覆盖：

- v0.8.4 加载
- 375px 无横向溢出
- 示例短句显示
- 示例短句点击不直接保存
- 解析预览打开
- “明天下午三点开会”确认创建
- 全部页搜索“开会”
- 日历 dot
- “每月15号还信用卡”显示每月
- “随便记个想法”进入无日期稍后整理
- 稍后整理可设为明天
- 体验示例后保存卡片入口仍可见
- 我的页语言 / 天气 / 备份仍可见
- 1366px 无横向溢出
- 桌面端解析预览仍可用
- 无明显 JavaScript 错误

## 15. 手机端检查

375px 本地检查通过：无横向溢出，首页输入、示例短句、解析预览、底部导航正常。

## 16. 桌面端检查

1366px 本地检查通过：无横向溢出，页面保持 v0.8.3 的 Web 宽屏布局，未改成后台管理样式。

## 17. 对 v0.8.3 功能影响

已回归检查：

- 时间旅程线仍可见
- 保存卡片入口仍可见
- 今日概览仍可见
- 我的页语言、天气、备份仍可见
- ICS 导出测试仍通过
- 备份加固测试仍通过

## 18. 是否 push

候选分支报告生成时未 push。

## 19. 是否 deploy

候选分支报告生成时未 deploy。

## 20. 是否 merge main

候选分支报告生成时未 merge main。

## 21. 风险

主要风险是 v0.8.4 在首页增加了保存前预览，会让录入多一步确认。已保留“直接保存”按钮和配置开关，降低老用户路径变化风险。

## 22. 回滚

若上线异常，可回滚到 v0.8.3 备份点：

```powershell
git switch main
git reset --hard shike-web-stable-before-v084-smart-capture
git push origin main --force-with-lease
```

如 v0.8.4 未创建备份 tag，则先回滚到 v0.8.3 部署成功 commit：

```powershell
git reset --hard 6d9a8e09ad8fea6923567e486020114ee4c8004e
```

## 23. 是否建议部署 v0.8.4

建议部署 v0.8.4。理由：功能范围可控，未引入后端和外部 API，测试和本地浏览器验收已通过，用户可见价值明确。
