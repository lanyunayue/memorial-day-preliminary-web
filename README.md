# 时刻 (Shike) v0.6.0

> 你的贴心记事助手。

## 产品说明

- **用户可见产品名**：时刻
- **副标题**：你的贴心记事助手
- **当前版本**：v0.6.0
- **数据存储**：浏览器 localStorage（本地保存，刷新不丢）

## 在线体验地址

为保证不同网络环境下的访问稳定性，项目提供主站与备用镜像。如遇某个平台访问异常，可切换至备用地址。

- **主站（GitHub Pages）**：https://lanyunayue.github.io/memorial-day-preliminary-web/
- **海外备用（Cloudflare Workers）**：https://memorial-day-preliminary-web.308138249.workers.dev/
- **历史镜像（Netlify）**：https://memorialdaylan.netlify.app/

## 核心功能

- **一句话记录**：首页输入框直接输入，自然语言自动整理标题、日期、时间
- **中文时间解析**：支持中文数字时间（九点、三点半）、相对时间（待会、半小时后）、时间段默认今天
- **批量整理**：粘贴多行文字，自动拆分为多条可保存草稿
- **记录类型**：提醒、纪念、习惯、备忘
- **通用大卡片**：所有类型记录均可切换为精美大卡片展示，支持自定义背景图
- **实时倒计时**：近时间提醒显示分钟/小时级实时倒计时，每分钟自动刷新
- **日历视图**：完整月历，有记录的日期有圆点标记，点击查看当日记录
- **本周日历条**：首页显示本周日历，今日高亮，有记录日期标记
- **系统通知**：支持 Notification API，到时间自动提醒
- **数据持久化**：localStorage 本地保存，刷新不丢
- **导出/导入**：支持 JSON 备份导出和导入
- **5套主题**：雾蓝 / 暖米 / 墨黑 / 松青 / 云母
- **PWA 支持**：可添加到桌面
- **语音输入**：支持 Web Speech API 语音识别（Chrome/Edge/Safari 推荐；微信内置浏览器自动隐藏语音按钮）
- **开场动画**：1.8秒高级品牌动画，可跳过，第二次访问不打扰

## 技术说明

- 纯 HTML + CSS + JavaScript 单文件应用，无外部依赖
- localStorage key: `shike_reminders_v1`
- 本地规则解析时间词，未接入真实大模型
- 响应式设计，移动端优先
- Service Worker 缓存：network-first 策略（HTML 始终获取最新版本）
- 数据结构：id, title, dateText, timeText, locationText, repeat, repeatText, note, archived, createdAt, updatedAt, recordKind, recordState, notifyMode, notifiedAt, cardStyle, coverImage, coverPreset, pinned, accentColor

## 解析支持

- **日期**：今天、明天、后天、大后天、待会/等一下/一会儿(+30分钟)、稍后(+1小时)、马上(+10分钟)、本周X、下周X、周X、星期X、月底、月末、月初、下个月、X月X日、X天后、X小时后、X分钟后
- **时间**：早上/上午/中午/下午/晚上/凌晨/睡前、X点、X点半、X点XX分、X:XX、中文数字（一到十二点）
- **相对时间**：待会/等一下/一会儿→当前+30分钟；稍后→+1小时；马上→+10分钟；半小时后→+30分钟；N小时后→当前+N小时；N分钟后→当前+N分钟
- **无日期有时间段**：默认今天（例如下午三点→今天15:00）
- **重复**：每天、每周X、每月X号、每年（生日/纪念日）
- **类型自动识别**：含生日/周年/纪念/恋爱 → 纪念；含每天/每周/每月/习惯 → 习惯；有日期时间 → 提醒；其他 → 备忘

## 倒计时显示规则

- 距离 < 1小时：还有 X 分钟
- 距离 < 24小时：还有 X 小时 X 分钟
- 距离 < 48小时：还有 1 天 X 小时 / 明天 HH:mm
- 距离 >= 48小时：还有 X 天
- 纪念类：已记录 X 天 / 还有 X 天 / 今天
- 习惯类：今天 HH:mm / 下次 HH:mm / 每天/每周/每月

## 大卡片样式

- 纪念类：默认大卡片，显示倒计时/已记录天数
- 提醒类（有明确时间）：可切换大卡片，显示实时倒计时
- 习惯类：可切换大卡片，显示重复规则
- 备忘类：可切换大卡片
- 所有大卡片支持：6套预置渐变、自定义图片、移除图片、置顶、主题色

## 浏览器兼容

| 环境 | 语音输入 | 文字记录 | 大卡片 | 推荐度 |
|------|---------|---------|--------|--------|
| Chrome/Edge 桌面 | ✅ | ✅ | ✅ | 推荐 |
| Safari iOS | ✅ | ✅ | ✅ | 推荐 |
| 微信内置浏览器 | 自动隐藏 | ✅ | ✅ | 可用 |
| Android Chrome | ✅ | ✅ | ✅ | 推荐 |

## 部署

- 源目录：`web-demo/memorial-day-champion/`
- 部署目录：`dist/memorial-day-preliminary-web/`
- 修改后同步两个目录再 commit + push
- **主站（GitHub Pages）**：从 main 分支根目录自动部署（https://lanyunayue.github.io/memorial-day-preliminary-web/）
- **海外备用（Cloudflare Workers）**：通过 `wrangler deploy` 自动部署（https://memorial-day-preliminary-web.308138249.workers.dev/）
- **历史镜像（Netlify）**：通过 git push 自动部署（https://memorialdaylan.netlify.app/）

## HarmonyOS 原生端

- 用户可见文案统一为"时刻"，副标题"你的贴心记事助手"
- 版本 v0.4.0
- Web 与 HarmonyOS 当前不实时同步
