# 时刻 v0.8.1 foundation candidate 报告

## 1. 分支

- 分支：`rematch-v081-foundation-candidate`
- 基线：`main` v0.8.0，HEAD `0ad0347`
- 本轮 commit：见最终输出的本地提交 hash
- 线上地址：`https://lanyunayue.github.io/memorial-day-preliminary-web/`
- 线上版本保持：v0.8.0

## 2. 新版本

- `APP_VERSION`：v0.8.1
- `APP_UPDATED_AT`：2026-07-09 20:35
- `sw.js` cache：`shike-v081-v27`
- `manifest.json`：未修改

## 3. 修改文件

- `index.html`
- `sw.js`
- `scripts/test-shike-time-sprite.js`
- `scripts/test-shike-regression-suite.js`
- `scripts/test-shike-ics-export.js`
- `scripts/test-shike-backup-hardening.js`
- `docs/day-work/rematch-v081-foundation-candidate-report.md`
- `docs/day-work/v081-deploy-plan.md`

## 4. .ics 功能

新增本地 `.ics` 生成能力，不接 Google Calendar API，不做云同步，不做系统级提醒。

已支持：

- 单条记录导出：详情抽屉中有“导出日历”。
- 批量导出：我的页“日历导出”区块。
- 普通提醒。
- 有时间提醒：`DTSTART` / `DTEND`，默认 30 分钟。
- 全天事件：`DTSTART;VALUE=DATE`，`DTEND` 为次日。
- 纪念日：`RRULE:FREQ=YEARLY`。
- 每天习惯：`RRULE:FREQ=DAILY`。
- 每月 N 号：`RRULE:FREQ=MONTHLY`。
- 每月底 / 每月末：`RRULE:FREQ=MONTHLY;BYMONTHDAY=-1`。
- 无日期记录：批量导出时跳过，并提示跳过数量。
- 文件名：`shike-calendar-YYYYMMDD.ics`、`shike-record-标题.ics`。

## 5. 备份增强

JSON 导出由纯数组升级为带元数据格式：

```json
{
  "app": "shike",
  "appVersion": "v0.8.1",
  "schemaVersion": 2,
  "exportedAt": "...",
  "recordCount": 5,
  "records": []
}
```

兼容：

- 旧版纯数组备份。
- 旧版 `{ records: [...] }` 备份。

导入策略：

- 默认追加导入，不覆盖现有数据。
- 导入前先解析并显示数量、版本、导出时间、缺失 id、重复 id、现有冲突、无效记录。
- 坏 JSON 不写入。
- 格式错误不写入。
- 缺失 id 自动补齐。
- 导入文件内部重复 id 自动重建。
- 与现有 id 冲突时重建导入记录 id。
- 导入后 `record.id` 保持唯一。
- 写入失败时回滚内存记录，不误报成功。

## 6. 用户可见变化

- “我的”页新增轻量“日历导出”区块。
- “我的”页新增轻量“数据安全”提示，说明数据保存在当前浏览器，建议重要记录定期备份。
- 记录详情中，带日期记录可单条导出 `.ics`。
- “整理”页原数据备份入口保留，导出的 JSON 文件更可靠。

## 7. 不支持能力

本轮没有做：

- Google Calendar 同步。
- Apple / Outlook 自动同步。
- 登录注册。
- 云同步。
- 数据库。
- LLM API。
- 推送服务。
- 新的时刻精灵动画或宠物系统。
- UI 大改或主题重做。

## 8. 测试命令与结果

已运行：

- `node scripts/test-shike-ics-export.js`：11/11 通过。
- `node scripts/test-shike-backup-hardening.js`：11/11 通过。
- `node scripts/test-shike-pwa-assets.js`：8/8 通过。
- `node scripts/test-shike-time-sprite.js`：8/8 通过。
- `node scripts/test-shike-regression-suite.js`：9/9 通过。

NLP 状态：

- `D:\lifetime\scripts\test-shike-nlp-parser.js` 不存在。
- `D:\lifetime-v081-foundation-candidate\scripts\test-shike-nlp-parser.js` 不存在。
- 本报告不写 NLP 102/102 或 104/104 通过。
- 本轮月重复相关新增覆盖由 `test-shike-ics-export.js` 验证。

## 9. 运行态验收

本地服务：

- `http://127.0.0.1:8781/`
- 已关闭本地服务和 Edge CDP 进程。

Edge headless CDP 自动验收：

- 视口：375、414、768、1366、1440。
- 页面：首页、全部、日历、整理、我的。
- 组合：25 个。
- 结果：0 failures。

检查项：

- 页面不白屏。
- 无横向溢出。
- 时刻精灵可见。
- 时刻精灵不遮挡输入框。
- 时刻精灵不遮挡底部导航。
- 体验示例生成 5 条。
- 全部页搜索“妈妈”可找到妈妈生日。
- 日历页有 dot。
- 整理页备份导出按钮可见。
- 我的页 `.ics` 导出按钮可见。
- 我的页版本号为 v0.8.1。

## 10. 手机端与桌面端

- 375 / 414：无横向溢出。
- 768：平板宽度正常。
- 1366 / 1440：桌面宽度正常。
- 本轮未改响应式 CSS。

## 11. 对既有能力影响

- 时刻精灵：未改视觉和动画；回归 8/8 通过。
- 体验示例：回归 6/6 通过，运行态生成 5 条通过。
- 搜索筛选：运行态搜索“妈妈”通过。
- 日历 dot：运行态通过。
- PWA：回归 8/8 通过，cache 已更新到 v0.8.1。
- 主题：未改主题系统。
- 天气、多语言、备份入口：未做无关重构。

## 12. 风险

- `.ics` 是标准文件导出，不是系统级提醒；用户仍需手动导入第三方日历。
- 不同日历客户端对本地无时区 `DTSTART` 的展示可能有差异，但本轮保持同一文件内格式一致。
- 单文件 `index.html` 继续变大，后续可考虑在复赛后做模块化拆分，但本轮不重构。

## 13. 回滚方式

未 push、未 deploy、未 merge main。回滚方式：

```bash
git switch main
git branch -D rematch-v081-foundation-candidate
```

如果已保留 worktree，需要先移除：

```bash
git worktree remove D:\lifetime-v081-foundation-candidate
```

## 14. 发布建议

建议保留为 v0.8.1 本地候选。若用户确认上线，再按 `docs/day-work/v081-deploy-plan.md` 执行。

当前状态：

- 未 push。
- 未 deploy。
- 未 merge main。
- 未修改 gh-pages。
- 未影响线上 v0.8.0。
