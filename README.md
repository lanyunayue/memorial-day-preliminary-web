# 时刻 (Shike)

> 一句话整理提醒，不错过重要时间。

## 产品说明

- **用户可见产品名**：时刻
- **项目代号**：Memorial day
- **当前版本**：本地 Web MVP（单文件应用）
- **公网体验**：https://memorialdaylan.netlify.app/

## 功能

- 一句话快速添加提醒：输入自然语言（如"明天下午3点交报告"），自动识别时间和事项
- 草稿确认：解析后生成可编辑草稿，确认后才保存
- 本地存储：所有数据保存在浏览器 localStorage，不上传服务器，不需要账号
- 多视图管理：今天 / 日历 / 全部 / 导入文字 / 我的
- 详情抽屉：查看、完成、删除提醒
- 数据导出/导入：支持 JSON 备份
- PWA 支持：可添加到桌面，离线可用

## 技术说明

- 纯 HTML + CSS + JavaScript 单文件应用，无外部依赖
- localStorage key: `shike_reminders_v1`
- 本地规则解析时间词（明天/下周/月底/上午/下午等），未接入真实大模型
- 响应式设计，移动端优先
- Service Worker 网络优先策略，确保更新后不显示旧版

## 关于识别能力

当前为本地规则识别，未接入真实大模型。能识别常见时间表达：
- 日期：今天、明天、后天、下周X、月底、X月X日
- 时间：上午/下午/晚上X点、HH:MM
- 重复：每周X、每月X日、每天
- 优先级关键词：信用卡/还款/截止/紧急 → 较高；健身/锻炼 → 较低

## 部署

- 源码仓库：`github.com/lanyunayue/memorial-day-preliminary-web`
- 通过 GitHub + Netlify 持续部署，每次 Push 到 main 分支后 Netlify 自动更新
- 不使用 Netlify Drop
- 修改后将文件同步到 `dist/memorial-day-preliminary-web/`，通过 git commit + push 触发部署

## 文件结构

- `index.html` — 单文件应用（HTML+CSS+JS）
- `manifest.json` — PWA 配置
- `sw.js` — Service Worker
- `README.md` — 本文件
