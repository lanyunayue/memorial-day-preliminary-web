# 时刻 (Shike)

> 一句话整理提醒，不错过重要时间。

## 产品说明

- **用户可见产品名**：时刻
- **项目代号**：Memorial day
- **当前版本**：Real Product v2（Web 功能完整产品 + HarmonyOS 原生端同步）
- **公网体验**：https://memorialdaylan.netlify.app/

## 功能（Web）

- 一句话快速添加提醒：输入自然语言（如"明天下午3点交报告"），自动识别时间和事项
- **可编辑草稿**：解析后生成草稿，可编辑标题/日期/时间/地点/优先级/备注，支持重新解析
- **提醒编辑**：已有提醒可随时修改所有字段
- **多行导入**：粘贴多行文字，自动拆分解析为多个草稿，支持单独保存或全部保存
- **TXT 文件导入**：上传 .txt 文件自动填入导入框
- **搜索与筛选**：按标题/日期/地点/原始内容搜索，支持未完成/已完成/高优先级筛选
- **排序**：默认排序（状态+优先级+时间）、创建时间、日期、优先级
- **多视图管理**：今天（含快截止/最近添加）/ 导入文字 / 日历（按日期分组）/ 全部 / 我的
- **快截止区域**：自动识别今天/明天/后天/本周/下周/月底等近期事项
- **真实统计**：全部/未完成/已完成数量，从 localStorage 实时计算
- **详情抽屉**：查看、编辑、标记完成、删除提醒
- **数据管理**：导出 JSON 备份、导入 JSON 恢复、清理已完成、清空所有数据
- **PWA 支持**：可添加到桌面，Service Worker 网络优先策略确保更新
- **自定义确认弹窗**：危险操作有确认弹窗，不用浏览器原生 confirm

## 技术说明

- 纯 HTML + CSS + JavaScript 单文件应用，无外部依赖
- localStorage key: `shike_reminders_v1`
- 本地规则解析时间词，未接入真实大模型
- 响应式设计，移动端优先，360px-480px 宽度优化
- Service Worker 缓存名：`shike-real-product-v2`，HTML/Manifest/SW 均使用 network-first 策略
- 数据结构包含：id, title, rawText, dateText, timeText, locationText, priority, repeatText, notesText, source, completed, createdAt, updatedAt

## 解析能力

当前为本地规则识别，未接入真实大模型。支持：

- **日期**：今天、明天、后天、大后天、本周X、下周X、周X、星期X、月底、月初、下个月、X月X日、X天后、X分钟后
- **时间**：早上/上午/中午/下午/晚上/凌晨 X点、X点半、HH:MM、中文数字时间（三点、九点半）、半小时后
- **重复**：每周X、每月X日、每年X月X日
- **地点**：在图书馆/教室/医院/公司/学校/电影院/家里 等
- **场景标题**：生日、健身、体检、信用卡、房租、交报告、开会、考试、看电影、旅行等20+场景
- **优先级关键词**：截止/必须/尽快/还款/信用卡/考试/面试/房租/重要/紧急 → 较高优先级

## 部署

- 源码仓库：`github.com/lanyunayue/memorial-day-preliminary-web`
- 通过 GitHub + Netlify 持续部署，每次 Push 到 main 分支后 Netlify 自动更新
- 不使用 Netlify Drop
- 源目录：`web-demo/memorial-day-champion/`
- 部署仓库：`dist/memorial-day-preliminary-web/`
- 修改后同步两个目录，通过 git commit + push 触发部署

## HarmonyOS 原生端

- 入口命名与Web保持一致：快速添加、导入文字、全部提醒、日历、我的
- 用户可见文案统一为"时刻"，标语"一句话整理提醒，不错过重要时间"
- SmartCreate → EditItem 草稿传递链路完整（smartCreateDraft + quick_create_template 双通道）
- ReminderCenter 和 Calendar 点击均可跳转 Detail 页面
- 未修改 RDB schema、FeatureFlags、通知底层、Widget 核心逻辑

## 文件结构

- `index.html` — 单文件应用（HTML+CSS+JS，约56KB）
- `manifest.json` — PWA 配置
- `sw.js` — Service Worker（network-first for HTML）
- `README.md` — 本文件
