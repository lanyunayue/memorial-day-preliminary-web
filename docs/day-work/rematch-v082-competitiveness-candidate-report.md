# 时刻 v0.8.2 复赛竞争力候选报告

## 1. 工作区

- 工作区：`D:\lifetime-v082-rematch-competitiveness`
- 分支：`rematch-v082-rematch-competitiveness`
- 基线 commit：`5379870d682482f6b8b92de4a344d7a68e16ad1e`
- 新 commit：见最终输出
- 版本号：v0.8.2

## 2. 修改文件

- `index.html`
- `sw.js`
- `scripts/test-shike-time-sprite.js`
- `scripts/test-shike-backup-hardening.js`
- `scripts/test-shike-regression-suite.js`
- `scripts/test-shike-ics-deep.js`
- `scripts/test-shike-data-safety-center.js`
- `scripts/test-shike-import-preview.js`
- `scripts/test-shike-pwa-notice.js`
- `docs/day-work/v082-rematch-demo-script.md`
- `docs/day-work/v082-judge-qa.md`
- `docs/day-work/rematch-v082-competitiveness-candidate-report.md`
- `docs/day-work/v082-deploy-plan.md`

## 3. .ics 深化

- 保持 CRLF 行分隔。
- 加强 SUMMARY / DESCRIPTION 文本转义覆盖。
- UID 基于 `record.id`。
- 保持全天事件 DTEND 为次日。
- 保持有时间事件默认 30 分钟。
- 保持月末规则 `RRULE:FREQ=MONTHLY;BYMONTHDAY=-1`。
- 保持纪念日 yearly。
- 批量导出继续跳过无日期记录并提示跳过数量。
- 我的页新增“如何导入日历”折叠说明，明确这是手动导入标准 `.ics` 文件。

## 4. 数据安全中心

位置：我的页。

新增内容：

- 当前记录数。
- 可导出日历数。
- 无日期记录数。
- 上次备份时间。
- 本地浏览器数据说明。
- JSON 备份与 `.ics` 区别说明。
- “导出 JSON 备份”按钮。
- “导入 JSON 备份”入口。
- 记录较多且未备份时给出温和建议。

## 5. 导入预览

导入 JSON 后不会立即写入。现在先展示页内预览卡：

- 文件类型：新版时刻备份 / 旧版数组备份 / 旧版 records 备份。
- appVersion。
- schemaVersion。
- exportedAt。
- 将导入记录数。
- 有效记录。
- 无效记录。
- 缺失 id。
- 重复 id。
- 与现有 id 冲突数。
- 导入模式：追加导入。
- 操作：确认导入 / 取消。

安全策略：

- 取消不写入。
- 确认后才写入。
- 写入前继续 normalize。
- 写入后 id 保持唯一。
- 坏 JSON 不显示预览，不写入。
- 写入失败不清空现有数据。

## 6. PWA / 提醒诚实增强

我的页新增“提醒说明”：

- 网页版提醒依赖浏览器环境。
- 页面关闭后，长期提醒不一定可靠。
- 建议添加到桌面并定期打开查看。
- 重要日程建议导出 `.ics` 到系统日历。
- 支持浏览器通知权限按钮。
- 支持 `beforeinstallprompt` 时显示“添加到桌面”，否则展示手动添加提示。

没有写“后台稳定提醒”“永久提醒”“自动同步”“系统级提醒”等夸大文案。

## 7. 复赛演示链路

我的页新增折叠入口“从一句话到日历”：

1. 输入一句话：明天下午三点开会。
2. 生成记录并进入日历。
3. 导出 `.ics` 到系统日历。
4. 导出 JSON 备份保护数据。

同时新增两份复赛材料：

- `docs/day-work/v082-rematch-demo-script.md`
- `docs/day-work/v082-judge-qa.md`

## 8. 用户可见变化

- 我的页更清楚地区分 `.ics` 和 JSON 备份。
- 我的页可看到本地数据安全状态。
- 导入 JSON 前有明确预览。
- 提醒能力边界更诚实。
- 复赛演示路线更容易讲清楚。

## 9. 不支持能力

仍不支持：

- 云同步。
- 登录注册。
- 数据库。
- Google Calendar API。
- 大模型 API。
- 自动同步。
- 后台常驻提醒。
- 新的精灵动画、养成、音效、等级或宠物系统。

## 10. 测试命令

已运行：

- `node scripts/test-shike-ics-deep.js`
- `node scripts/test-shike-data-safety-center.js`
- `node scripts/test-shike-import-preview.js`
- `node scripts/test-shike-pwa-notice.js`
- `node scripts/test-shike-regression-suite.js`

完整套件包含：

- PWA assets
- HTML integrity
- A11y static
- Demo examples
- Time sprite
- Responsive CSS
- I18N placeholders
- ICS export
- Backup hardening
- ICS deep
- Data safety center
- Import preview
- PWA notice

当前 worktree 未携带完整 NLP 脚本，本轮未声明 NLP 通过数量。

## 11. 测试结果

- ICS deep：14/14 通过。
- Data safety center：9/9 通过。
- Import preview：10/10 通过。
- PWA notice：6/6 通过。
- 总回归：13/13 通过。

## 12. 运行态验收

本地地址：`http://127.0.0.1:8782/`

Edge CDP 自动验收：

- 视口：375、390、414、768、1024、1366、1440。
- 页面：首页、全部、日历、整理、我的。
- 组合：35。
- 结果：35/35 通过。
- 夜间主题检查：通过。

检查项包括：

- 页面不白屏。
- 无横向溢出。
- 时刻精灵正常。
- 首页输入框可用。
- 体验示例生成 5 条。
- 搜索可用。
- 日历 dot 可见。
- 整理页无拥挤。
- 我的页无拥挤。
- `.ics` 导出区域可见。
- 数据安全区域可见。
- 导入预览可用。
- 提醒说明可见。
- 手机底部导航不被遮挡。
- 桌面端不是手机窄条。

## 13. 影响评估

- 时刻精灵：未改视觉与动画，回归 8/8 通过。
- 体验示例：回归 6/6 通过，运行态生成 5 条通过。
- v0.8.1 `.ics`：保留并加强，ICS export 11/11、ICS deep 14/14。
- 备份：保留并加强，Backup hardening 11/11、Import preview 10/10。
- PWA：cache 更新到 `shike-v082-v28`，PWA assets 8/8，PWA notice 6/6。

## 14. 发布状态

- 未 push。
- 未 deploy。
- 未 merge main。
- 未修改 gh-pages。
- 未覆盖线上 v0.8.0。

## 15. 风险

- `.ics` 仍是手动导入文件，不是自动同步。
- Web 版提醒仍受浏览器环境限制。
- 数据仍默认在 localStorage，本地清理浏览器数据可能影响记录。
- 单文件 `index.html` 继续增大，后续可规划模块化。

## 16. 回滚方式

本轮未推送未部署，删除候选即可：

```bash
git worktree remove D:\lifetime-v082-rematch-competitiveness
git branch -D rematch-v082-rematch-competitiveness
```

## 17. 是否建议部署

可以作为 v0.8.2 候选保留。若用户确认上线，可直接部署 v0.8.2，因为它包含 v0.8.1 的 foundation 能力。

当前默认建议：先让用户看报告与部署计划，再决定是否上线。
