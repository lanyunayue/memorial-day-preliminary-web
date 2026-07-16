# v1.5.0 时刻精灵工作台候选报告

候选日期：2026-07-11
分支：`rematch-v150-bear-workbench`
基线：`origin/main@afa00169eefc4b8276f4d1ae1746890b164976c9`
版本：`v1.5.0`
缓存：`shike-v150-v54`

## 一句话总结

在不改 NLP parser 和记录 schema 的前提下，把 v1.4.1 的悬浮小熊升级为手机抽屉、平板双列、桌面停靠的完整工作台，并加入真实公开资料检索、真实关注内容、精灵状态/定制/声音/可选 3D 和诚实降级。

## 主要实现

### 自适应布局

- 手机 `<768px`：单列、底部导航、悬浮精灵、全宽底部抽屉，抽屉与导航无重叠。
- 平板 `768–1099px`：首页主输入与记录辅助区双列，工作台保持可折叠。
- 桌面 `>=1100px`：主区 720–940px，右侧工作台 320–380px；1366px 实测主区 920px。
- 同时使用宽度断点与 hover/pointer 能力查询。

### 精灵工作台

- 15 个互斥状态：idle、blink、wave、listening、thinking、searching、planning、waiting-confirmation、working、speaking、success、warning、error、sleeping、dragging。
- 状态具备 enter/exit 事件、自动回 idle、页面隐藏、reduced-motion、aria-label 和异常隔离。
- 工作台包含对话、概览、设置三个 tab；对话渲染上限 60 条。
- 保留现有本地工具、确认策略、修改/取消和持久化失败回滚。

### 外观、声音与 3D

- 18 项本地偏好：名称、主辅色、眼睛、表情、耳朵、帽子、眼镜、围巾、徽章、光环、动画、2.5D/3D、提示音、语音、voice、语速、音量。
- 默认 2.5D；原生 WebGL 程序化小熊仅用户开启后初始化，失败自动回 2.5D，无远程模型或 Three.js 依赖。
- Web Audio 生成 success/reminder/warning/error/confirmation 短提示音；首次交互后解锁。
- speechSynthesis 默认关闭，支持播放、停止、重放、voice、rate、volume。

### 公开资料检索

- 独立 query classifier、provider registry、normalizer、ranker、extractive summarizer、cache 和 search fallback。
- 接入 Wikipedia、Wikidata、GitHub、Stack Exchange、Open-Meteo；统一来源结构，URL/标题去重，7 秒独立超时。
- 只缓存非空成功结果，避免网络失败被固化。
- 资料不足时显示已查询来源、失败和百度/必应/Google 搜索入口。
- 浏览器内置 AI 默认关闭且按语言检测；不可用时保持规则提取式总结。

### 关注中心

- 移除静态模拟资讯。
- 推荐公开来源、关键词、自定义 RSS、来源/关键词/新鲜度/已读筛选、刷新状态、错误摘要、原文链接和本地已读。
- 无关键词时查询真实推荐主题；自定义 RSS 仅直连允许 CORS 的地址。

### 双重提醒

- 保留页面打开时的 Notification 到期检查。
- 保留标准 `.ics` 导出作为系统日历长期提醒方案。
- 继续明确说明：GitHub Pages PWA 关闭页面后不能保证长期后台通知。

## 修改边界

- `src/legacy-app.js` 仅增加一行读取独立发布说明；parser 函数未改。
- `src/parser/parser-adapter.js` 未改。
- `src/records/record-normalizer.js` 未改。
- `src/storage/migrations.js` 未改。
- 未新增 record schema 字段，精灵/检索/关注偏好均使用独立 localStorage key。
- `E:\lifetime-web` 未作为开发或发布目录；`E:\lifetime` 未修改。

## 测试结果

- 全量静态/VM 回归：58/58。
- v1.5 专项：76/76。
- Watch Center：39/39。
- Edge 完整体验：33/33。
- 12 视口 bounding-box：12/12。
- WebGL canvas：非空像素通过，失败路径可回退。
- 联网运行时：GitHub 5 条、Open-Meteo 1 条、关注中心 5 条；知识问答未写入记录。
- 存储迁移（全新 profile）：10/10。
- Agent runtime：12/12。
- 离线启动：3/3。
- parser-adapter SHA-256：`efbff968efd518e26970bac24ad35396df8482a32ba56011c6670167d58c4b58`，与基线一致。
- parseReminderText SHA-256：`4a628925b331cf3f56e13440cf5af51b49efe4ca24db1e1f8794e03aba394d69`，与基线一致。
- record normalizer SHA-256：`5f6bad0d5cc87e36520e39317c338ee819afd9f6c0df641fa4ac66c8f0bd3a8f`，与基线一致。
- storage migrations SHA-256：`7d01a2297770f762ac10e3e4a5d8e69a2b4bceaef6156ade829401d054498fec`，与基线一致。

## 视口与截图

已验收：360×640、375×667、390×844、414×896、768×1024、820×1180、1024×768、1280×720、1366×768、1440×900、1920×1080、2560×1440。

截图和 JSON 证据位于：

- `E:\lifetime-web-audit-artifacts\v150-bear-workbench\screenshots-v150-responsive`
- `E:\lifetime-web-audit-artifacts\v150-bear-workbench\screenshots-v150-experience-final`
- `E:\lifetime-web-audit-artifacts\v150-bear-workbench\screenshots-v150-runtime`

## 已知限制

- Wikipedia/Wikidata 在当前网络偶发超时；会继续其他 provider 或显示网页搜索。
- GitHub 未认证搜索配额低，结果缓存 15 分钟；达到限额后明确失败，不自动绕过。
- 自定义 RSS 是否成功由源站 CORS 决定。
- Prompt API 中文支持当前不足，中文环境通常继续规则总结。
- Open-Meteo 免费端仅适合当前非商业形态，商业化前必须处理授权。
- PWA 关闭页面后无法保证本地通知，重要事项应导出 `.ics`。

## 发布建议

候选满足 v1.5.0 发布闸门。发布前应创建 `shike-web-stable-before-v150-bear-workbench` 回滚 tag，确认 `origin/main` 仍为 `afa0016`，再从本分支快进推送 main。发布后验证根地址版本、cache、桌面工作台、手机抽屉、知识查询、关注中心、离线启动和 GitHub Pages workflow。
