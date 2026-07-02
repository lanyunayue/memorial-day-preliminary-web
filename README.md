# Memorial day

**AI 时间整理 Agent** — 用多模态输入帮你把碎片化的提醒、通知、待办整理成清晰的时间线，告别漏事。

---

## 如何打开

### 方式一：直接双击（最简单）
双击 `index.html`，用 Chrome / Edge 浏览器打开即可体验（语音识别需 localhost/HTTPS）。

### 方式二：本地静态服务器（推荐，语音识别可用）
```bash
# Python 3（任意系统）
python -m http.server 8080
# 然后浏览器打开 http://localhost:8080
```

### 方式三：VS Code Live Server
右键 `index.html` → "Open with Live Server"。

### 公网体验
**https://memorialdaylan.netlify.app/** （GitHub 持续部署，每次 Push 后 Netlify 自动更新）

---

## 当前公网部署方式（V4.0）

公网版本通过 GitHub 仓库持续部署自动发布：

- GitHub 仓库：`github.com/lanyunayue/memorial-day-preliminary-web`
- 本地仓库目录：`E:\lifetime\dist\memorial-day-preliminary-web`
- 部署流程：TRAE 修改源码 → 同步到 dist → GitHub Desktop Commit to main → Push origin → Netlify 自动部署
- Zip 包仅作为比赛附件/离线备份，不作为部署方式

---

## 作品说明

- **作品名称**：Memorial day
- **定位**：本地 AI 时间整理 Agent
- **目标用户**：学生、班级干部、教师/辅导员、社团/项目负责人、实习生、个人日程管理
- **形态**：静态 Web / PWA 应用（单页应用，可安装到主屏）
- **技术栈**：纯 HTML + CSS + JavaScript，零外部依赖、零 CDN、零构建步骤
- **PWA 支持**：带 `manifest.json` 和 `sw.js`（v4.0，network-first for HTML），可添加到主屏，支持离线缓存
- **版本**：V4.0 · GitHub Auto Deploy

### 核心功能
1. **今天**（默认首页）：快速添加输入框、今天事项、快截止事项、Agent 建议
2. **快速添加**：输入一句安排自动识别日期/时间/地点/优先级，生成可编辑草稿，确认后保存
3. **收集箱**：粘贴通知 / 上传 TXT / 解析与我有关的提醒 / 批量保存草稿
4. **日历视图**：今天/明天/本周/未来时间线视图
5. **清单管理**：全部/未完成/已完成/高优先级筛选、搜索、标记完成
6. **多场景支持**：学生 / 班级干部 / 教师 / 社团 / 实习 / 个人六大使用场景
7. **语音输入**：Web Speech API（Chrome/Edge + HTTPS），不支持时明确降级
8. **Detail Drawer**：右侧抽屉详情、倒计时、Agent 解读
9. **我的**：场景设置、数据管理（导出/导入/重置）、诚实说明、版本信息
10. **本地持久化**：所有数据保存在 localStorage，刷新不丢失

---

## 诚实边界声明

1. **AI 能力**：当前 Web Demo 使用**本地规则 + 示例 AI 流程模拟**，未接入真实大模型。
2. **TXT 文件读取**：TXT 上传为**真实功能**（FileReader API）。
3. **PDF/DOCX 解析**：初赛版本为 Mock 状态，复赛阶段接入 pdf.js / mammoth.js。
4. **语音识别**：使用浏览器原生 Web Speech API，需 Chrome/Edge + HTTPS/localhost，浏览器不支持时明确降级提示。
5. **Watch 端**：演示中的 Watch 界面为 Mock。
6. **系统通知**：页面内 Toast 是页面内模拟提醒，不是系统级通知（HarmonyOS 原生端支持系统通知）。
7. **HarmonyOS 原生端**：核心架构已搭建（RDB/Widget/系统通知），是复赛重点深化方向。
8. **上线状态**：作品尚未正式上线，无真实用户数据。

---

## 文件清单

| 文件 | 说明 |
|---|---|
| `index.html` | **主文件**（全部 CSS/JS/HTML 内联） |
| `manifest.json` | PWA 应用清单 |
| `sw.js` | Service Worker（v4.0，network-first for HTML） |
| `README.md` | 本说明文件 |
| `PRELIMINARY_SUBMISSION_README.md` | 初赛提交详细说明 |
| `.nojekyll` | GitHub Pages 必需 |

---

浏览器打开 `index.html` 即可。
