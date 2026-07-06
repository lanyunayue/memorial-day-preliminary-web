# 时刻 (Shike) v0.8.0

> 你的贴心记事助手。

## 产品说明

- **用户可见产品名**：时刻
- **副标题**：你的贴心记事助手
- **当前版本**：v0.8.0
- **更新日期**：2026-07-07
- **数据存储**：浏览器 localStorage（本地保存，刷新不丢）

## 在线体验地址

- **主站（GitHub Pages）**：https://lanyunayue.github.io/memorial-day-preliminary-web/
- **海外备用（Cloudflare Workers）**：https://memorial-day-preliminary-web.308138249.workers.dev/
- **历史镜像（Netlify）**：https://memorialdaylan.netlify.app/

## 核心功能

- **一句话记录**：自然语言自动整理标题、日期、时间
- **首页极简设计**：无记录居中输入，首条后平滑上移，实时日期时间
- **中文时间解析**：点钟/半/刻/中文数字/待会/马上/稍后/半小时后/N小时后/下午晚上凌晨默认今天
- **批量整理**：粘贴多行自动拆分
- **4种类型**：提醒、纪念、习惯、备忘
- **通用大卡片**：所有类型支持大卡片；预置8套渐变、自定义图片上传（Canvas压缩）、主题色、置顶
- **实时倒计时**：分钟/小时/天级，每分钟刷新
- **日历视图**：月历、节假日高亮、农历切换、点击日期快速新建、多类型彩色圆点
- **数据管理**：搜索、类型筛选、排序、批量归档/删除、置顶星标
- **8套主题**：米白/黑白/咖啡/雾蓝/玫瑰/森林/暗色/樱花，完整 token 适配
- **多语言**：简体中文/繁體中文/English/日本語
- **天气**：基于 Open-Meteo，30分钟缓存
- **浏览器通知**：Notification API，支持/拒绝/不支持三态
- **重复纪念日**：生日/纪念日自动每年循环，显示距离下次天数
- **导出图片**：大卡片可导出为 PNG
- **纪念统计 + 习惯柱状图**：我的页可视化
- **备份/恢复**：JSON 导出导入，跨设备迁移
- **PWA 支持**：Service Worker network-first，更新 toast 提示
- **微信语音降级**：UA 检测自动隐藏
- **开场动画**：1.8s 可跳过品牌动画
- **可访问性**：aria-label、Esc/Enter/Ctrl+K、focus-visible
- **移动端适配**：320-768px 响应式，无横向滚动，touch target ≥ 40px
- **性能**：debounce、分页渲染、图片压缩、后台暂停定时器

## 技术说明

- 纯 HTML + CSS + JavaScript 单文件应用
- localStorage key: `shike_records_v1` / `shike_settings_v1`
- 本地 NLP 解析，未接入真实大模型
- 响应式移动端优先
- Service Worker：network-first，cache shike-v080-v3
- 数据迁移：migrateRecord() 全字段默认值兜底

## NLP 解析能力

- 日期：今天/明天/后天/大后天/周X/下周X/月底/月末/X月X日/X天后
- 相对时间：待会/等一下/一会儿→+30min；稍后→+60min；马上→+10min；N小时后→+N*60min；N分钟后→+Nmin
- 时间段+钟点：下午/晚上/晚+1-11点→+12h；凌晨1-11点→原值；中午12点→12:00；早上/上午12点→00:00
- 中文数字：一到十二点、一点半、三点一刻、九点三刻、十点XX分
- 点钟：支持"八点钟""九点钟"，标题清洗无"钟"残留
- 睡前→22:30
- 无日期有时间段默认今天
- 重复：每天/每周X/每月X号/每年（生日/纪念日自动 yearly）
- 标题清洗：时间词/日期词/填充词（要/记得/别忘了 at edges）自动剥离，保护"生日/纪念日"

## 主题

| 主题 | 主色 | 适用场景 |
|------|------|---------|
| 米白 | #b8553f 暖红 | 默认，日常 |
| 黑白 | #1c1917 墨黑 | 极简 |
| 暖棕 | #8b5a3c 棕 | 咖啡调 |
| 雾蓝 | #4a7a8a 蓝 | 清晨 |
| 玫瑰 | #c15c66 玫红 | 纪念 |
| 森林 | #4f7a48 绿 | 自然 |
| 暗色 | #d8b872 金 | 夜间 |
| 樱花 | #c77b8b 粉 | 柔和 |

## 浏览器兼容

| 环境 | 语音 | 文字 | 大卡片 | 天气 | 通知 |
|------|------|------|--------|------|------|
| Chrome/Edge | ✅ | ✅ | ✅ | ✅ | ✅ |
| Safari iOS | ✅ | ✅ | ✅ | ✅ | ✅ |
| 微信内置 | 自动隐藏 | ✅ | ✅ | 定位受限 | 不支持 |
| Android Chrome | ✅ | ✅ | ✅ | ✅ | ✅ |

## 部署

- 源目录：`web-demo/memorial-day-champion/`
- 部署目录：`dist/memorial-day-preliminary-web/`
- 主站（GitHub Pages）：gh-pages 分支根目录自动部署
- 海外备用（Cloudflare Workers）：wrangler deploy
- 历史镜像（Netlify）：git push 自动部署

## HarmonyOS 原生端

- 版本 v0.8.0
- 同步：NLP增强、首页token化、Inbox搜索/筛选/批量/置顶、日历快速新建、我的页统计、备份说明
- 不修改 RDB schema，使用 PersistentStorage + AppPreferences
