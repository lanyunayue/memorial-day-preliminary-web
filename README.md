# 时刻 (Shike) v0.5.1

> 你的贴心记事助手。

## 产品说明

- **用户可见产品名**：时刻
- **副标题**：你的贴心记事助手
- **当前版本**：v0.5.1
- **数据存储**：浏览器 localStorage（本地保存，刷新不丢）

## 在线体验地址

为保证展示稳定性，项目提供多个静态镜像地址。如遇某个平台访问异常，可切换至备用地址。

- **主站（Cloudflare Workers）**：https://memorial-day-preliminary-web.308138249.workers.dev/
- **备用站（GitHub Pages）**：https://lanyunayue.github.io/memorial-day-preliminary-web/
- **历史镜像（Netlify）**：https://memorialdaylan.netlify.app/

## 核心功能

- **一句话记录**：首页输入框直接输入，自然语言自动整理标题、日期、时间
- **批量整理**：粘贴多行文字，自动拆分为多条可保存草稿
- **记录类型**：提醒、纪念、习惯、备忘
- **大卡片展示**：每条记录以大卡片展示，显示类型、日期、倒计时/已记录天数
- **日历视图**：完整月历，有记录的日期有圆点标记，点击查看当日记录
- **本周日历条**：首页显示本周日历，今日高亮，有记录日期标记
- **系统通知**：支持 Notification API，到时间自动提醒
- **数据持久化**：localStorage 本地保存，刷新不丢
- **导出/导入**：支持 JSON 备份导出和导入
- **5套主题**：雾蓝 / 暖米 / 墨黑 / 松青 / 云母
- **PWA 支持**：可添加到桌面
- **语音输入**：支持 Web Speech API 语音识别（Chrome/Edge 推荐）

## 技术说明

- 纯 HTML + CSS + JavaScript 单文件应用，无外部依赖
- localStorage key: `shike_reminders_v1`
- 本地规则解析时间词，未接入真实大模型
- 响应式设计，移动端优先
- Service Worker 缓存：network-first 策略（HTML 始终获取最新版本）
- 数据结构：id, title, rawText, dateText, timeText, locationText, repeat, repeatText, note, archived, createdAt, updatedAt, recordKind, recordState, notifyMode, notifiedAt

## 解析支持

- **日期**：今天、明天、后天、大后天、本周X、下周X、周X、星期X、月底、月初、下个月、X月X日、X天后、X小时后、X分钟后
- **时间**：早上/上午/中午/下午/晚上/凌晨/睡前、X点、X点半、HH:MM
- **重复**：每天、每周X、每月X号、每年（生日/纪念日）
- **类型自动识别**：含生日/周年/纪念/恋爱 → 纪念；含每天/每周/每月/习惯 → 习惯；有日期时间 → 提醒；其他 → 备忘

## 数据状态

- recordState: active（记录中）/ notified（已提醒）/ archived（已隐藏）
- 不使用"完成/未完成"概念，记录一旦创建即保存，可隐藏

## 部署

- 源目录：`web-demo/memorial-day-champion/`
- 部署目录：`dist/memorial-day-preliminary-web/`
- 修改后同步两个目录再 commit + push
- **Cloudflare Workers（主站）**：通过 `wrangler deploy` 以 Workers Static Assets 方式部署，自动从 main 分支部署
- **GitHub Pages（备用）**：已启用，从 main 分支根目录自动部署（https://lanyunayue.github.io/memorial-day-preliminary-web/）
- **Netlify（历史镜像）**：通过 git push 自动部署（https://memorialdaylan.netlify.app/）

### Cloudflare 部署说明

- 使用 Cloudflare Workers Static Assets 托管静态文件
- 构建命令：`npx wrangler deploy`（由 Cloudflare 自动执行）
- 配置文件：`wrangler.toml`（Workers Static Assets 配置，指定 `assets.directory = "./"`）
- 响应头配置：`_headers` 文件
- 每次 push 到 main 分支自动触发重新部署

## HarmonyOS 原生端

- 用户可见文案统一为"时刻"，副标题"你的贴心记事助手"
- 版本 v0.4.0
- 系统提醒能力由原生通知模块继续完善，当前以本地记录和页面提醒为主
- Web 与 HarmonyOS 当前不实时同步
