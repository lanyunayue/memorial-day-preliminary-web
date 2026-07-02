# Memorial day

**AI 时间整理 Agent** — 用多模态输入帮你把碎片化的提醒、通知、待办整理成清晰的时间线，告别漏事。

---

## 如何打开

### 方式一：直接双击（最简单）
双击 `index.html`，用 Chrome / Edge 浏览器打开即可体验。

### 方式二：本地静态服务器（推荐，语音识别可用）
```bash
# Python 3（任意系统）
python -m http.server 8080
# 然后浏览器打开 http://localhost:8080
```

### 方式三：VS Code Live Server
右键 `index.html` → "Open with Live Server"。

### 方式四：部署到公网
将本目录所有文件上传到 Vercel / Netlify / GitHub Pages 等静态托管平台即可获得公网链接。本项目**不需要后端**，**不需要构建**，**不需要 npm install**。

---

## 作品说明

- **作品名称**：Memorial day
- **定位**：AI 时间整理 Agent
- **形态**：静态 Web / PWA Demo（单页应用）
- **技术栈**：纯 HTML + CSS + JavaScript，零外部依赖、零 CDN、零构建步骤
- **PWA 支持**：带 `manifest.json` 和 `sw.js`，可添加到主屏，支持离线缓存

### 核心功能
1. **App Shell 产品化**：左侧导航（桌面）+ 底部 Tab（移动端）+ 顶部状态栏 + 主内容区
2. **Agent Chat 对话**：自然语言/语音/快捷短语输入，Agent 识别事项/时间/地点/风险，一键保存为提醒
3. **通知收件箱**：内置 5 份示例通知，支持 TXT 文件真实上传，AI 提取与当前身份相关的提醒草稿
4. **身份筛选**：设置班级/身份，自动过滤通知中与我无关的事项
5. **我的提醒列表**：按时间排序、筛选搜索、标记完成、风险等级标签
6. **风险中心**：自动识别逾期/今日/未来3天/高风险/缺时间/同日多事项 6 类风险
7. **日程视图**：今日/本周/本月时间轴视图
8. **Detail Drawer**：右侧抽屉详情、大字号倒计时、Agent 解读
9. **TimeCard 时光卡片工坊**：6 套主题（考试蓝/生日粉/财务紫/健康绿/代码黑/旅行青）实时预览
10. **模拟提醒 Toast**：右上角毛玻璃 Toast 模拟到点提醒体验
11. **本地持久化**：所有数据保存在 localStorage，刷新不丢失
12. **60 秒体验流程**：一键走完全闭环

---

## 诚实边界声明

为保证评审公平，以下事项如实说明：

1. **AI 能力**：当前 Web Demo 使用**本地规则 + 示例 AI 流程模拟**（正则+关键词+日期逻辑），未接入真实大模型，目的是让评委体验完整产品闭环。
2. **TXT 文件读取**：TXT 上传为**真实功能**（FileReader API），可上传任意 TXT 文件真实解析。
3. **PDF/DOCX 解析**：初赛版本为 Mock 状态（内置示例数据），复赛阶段接入 pdf.js / mammoth.js 实现真实解析。
4. **语音识别**：Web Speech API 在 HTTPS/localhost 下由浏览器原生支持，在非 Chrome/Edge 或 file:// 协议下可能不可用，不影响核心文字/文件交互流程。
5. **Watch 端**：演示中的 Watch 界面为 Mock，不是已完成的 HarmonyOS 原生 Watch App。
6. **系统通知**：页面内 Toast 是页面内模拟提醒，不是系统级通知。HarmonyOS 原生端复赛接入系统通知。
7. **TimeCard 图片导出**："下载卡片"按钮为 Mock，真实 html2canvas 导出复赛完善。
8. **HarmonyOS 原生端**：核心架构（SmartCreate/TimeCard/TimeInsights 页面、RDB 存储、Widget 框架）已搭建，是复赛重点深化方向。
9. **上线状态**：作品尚未正式上线，无真实用户数据，所有班级/通知/提醒均为示例数据。
10. **iPhone 体验**：通过 Safari/Web 体验，无法安装 HAP 安装包（跨平台页已明确标注）。

---

## 文件清单

| 文件 | 说明 |
|---|---|
| `index.html` | **主文件**（全部 CSS/JS/HTML 内联，约 126KB） |
| `manifest.json` | PWA 应用清单（名称/图标/主题色/启动方式） |
| `sw.js` | Service Worker（离线缓存） |
| `README.md` | 本说明文件 |
| `PRELIMINARY_SUBMISSION_README.md` | 初赛提交详细说明 |
| `.nojekyll` | GitHub Pages 必需（禁用 Jekyll 处理） |

---

## 不需要什么

- 不需要后端服务器
- 不需要数据库
- 不需要登录账号
- 不需要 API Key
- 不需要 npm / node 环境
- 不需要网络连接（语音识别除外）

浏览器打开 `index.html` 即可。
