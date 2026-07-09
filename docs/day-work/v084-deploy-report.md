# 时刻 v0.8.4 部署成功报告

## 结论

v0.8.4 smart capture 已成功部署到 GitHub Pages。

正式地址：

https://lanyunayue.github.io/memorial-day-preliminary-web/

## 版本

- APP_VERSION：v0.8.4
- sw.js cache：shike-v084-v30

## main commit

部署代码 commit：

e4ab30647b1d70a265741493e01fae4826ae5556

## 备份 tag

上线前已创建并推送：

shike-web-stable-before-v084-smart-capture

该 tag 指向 v0.8.3 部署成功点：

6d9a8e09ad8fea6923567e486020114ee4c8004e

## 本次功能

v0.8.4 增加 smart capture 底座：

- 首页示例短句
- 保存前解析预览
- 类型 / 重复 / 日期 / 时间纠错 chips
- 无日期内容的稍后整理
- 稍后整理中设为今天 / 明天

没有新增后端、云同步、登录、数据库、Google Calendar API、LLM API。

## 上线前测试

在 D:\lifetime main 上执行：

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

结果：

- clean candidate suite：20/20 通过
- parse preview：10/10 通过
- correction chips：10/10 通过
- later inbox：10/10 通过
- example chips：7/7 通过
- time sprite：8/8 通过
- backup hardening：11/11 通过
- ICS export：11/11 通过
- ICS deep：14/14 通过

## 线上验证

GitHub Pages root 和 sw.js 验证：

- root：v0.8.4
- sw.js：shike-v084-v30

线上 Headless Edge 验收：18/18 通过。

覆盖：

- v0.8.4 正式地址加载
- 375px 无横向溢出
- 1366px 无横向溢出
- 5 个示例短句可见
- 点击示例短句只打开预览，不直接写入记录
- “明天下午三点开会”可预览并确认创建
- 全部页搜索“开会”可找到记录
- 日历页有 dot
- “每月15号还信用卡”预览显示每月
- “随便记个想法”进入稍后整理
- 稍后整理“设为明天”可用
- 体验示例后保存卡片入口仍可见
- 我的页语言 / 天气 / 备份仍可见
- 桌面端解析预览仍可用
- 无明显 JavaScript 错误

## 回滚方式

如需回滚：

```powershell
cd D:\lifetime
git switch main
git reset --hard shike-web-stable-before-v084-smart-capture
git push origin main --force-with-lease
```

回滚后重新验证正式地址恢复 v0.8.3 / shike-v083-v29。

## 后续建议

先停止在 v0.8.4，观察线上实际体验，不继续自动开发 v0.8.5。
