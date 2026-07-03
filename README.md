# 时刻 (Shike)

> 你的贴心记事助手。

## 产品说明

- **用户可见产品名**：时刻
- **副标题**：你的贴心记事助手
- **当前版本**：Premium Stability v7
- **公网体验**：https://memorialdaylan.netlify.app/

## 功能（Web）

- **快速添加**：首页一句话输入，自然语言自动识别（如"明天下午3点交报告"）
- **语音输入**：浏览器语音识别，支持中文，Edge/Chrome稳定可用
- **提醒大卡片**：下一个提醒以大卡片展示，显示倒计时（今天/明天/还有X天/已过期X天）
- **草稿编辑**：解析后可编辑标题/日期/时间/地点/重复/备注，支持重新解析
- **多行导入**：粘贴多行文字，自动拆分解析为多个草稿
- **TXT/JSON 文件导入**：支持 .txt 文件和 JSON 备份文件
- **搜索与排序**：按关键词搜索，未完成/已完成分段，最近添加/日期顺序
- **日历视图**：月历+日期标记，点击查看当日提醒
- **详情抽屉**：查看、编辑、标记完成、删除提醒
- **数据管理**：导出 JSON 备份、导入 JSON 恢复、清理已完成、清空数据
- **撤销删除**：删除后5秒内可撤销
- **5套高级主题**：雾蓝 / 砂岩暖 / 墨色夜间 / 鼠尾草绿 / 云母紫
- **PWA 支持**：可添加到桌面
- **反馈机制**：保存/编辑/删除/导入/导出/语音/主题切换均有明确toast反馈

## 技术说明

- 纯 HTML + CSS + JavaScript 单文件应用，无外部依赖
- localStorage key: `shike_reminders_v1`
- 主题 key: `shike_theme_v1`
- 引导 key: `shike_onboarding_seen_v1`
- 本地规则解析时间词，未接入云端服务
- 响应式设计，移动端优先
- Service Worker 缓存名：`shike-premium-v7`，HTML/Manifest/SW 使用 network-first 策略
- 数据结构：id, title, rawText, dateText, timeText, locationText, repeat, repeatText, note, completed, createdAt, updatedAt, ts（legacyPriority 仅为旧数据兼容，不展示）

## 解析能力

本地规则识别，支持：

- **日期**：今天、明天、后天、大后天、本周X、下周X、周X、星期X、月底、月初、下个月、X月X日、YYYY年M月D日、X天后、X分钟后
- **时间**：早上/上午/中午/下午/晚上/凌晨 X点、X点半、HH:MM、中文数字时间
- **重复**：每周X、每月X号、每年X月X日
- **地点**：在图书馆/教室/医院/公司/学校/电影院/家/宿舍/食堂/办公室/咖啡厅/机场/车站

## 部署

- 部署仓库：`dist/memorial-day-preliminary-web/`
- 通过 git push 触发 Netlify 自动部署
- 源目录：`web-demo/memorial-day-champion/`
- 修改后同步两个目录再 commit + push

## HarmonyOS 原生端

- 用户可见文案统一为"时刻"，副标题"你的贴心记事助手"
- SmartCreate、ReminderCenter、Calendar、My、About 均同步更新
- 未修改 RDB schema、FeatureFlags、通知底层、Widget 核心逻辑

## 文件结构

- `index.html` — 单文件应用（HTML+CSS+JS）
- `manifest.json` — PWA 配置
- `sw.js` — Service Worker
- `README.md` — 本文件
