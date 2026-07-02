# 初赛提交说明（PRELIMINARY SUBMISSION README）

## 一、本地打开方式

### 1. 直接双击打开
直接双击 `index.html`，使用浏览器打开即可，**无需启动任何服务器**。所有逻辑均为纯前端实现，双击即可运行。

### 2. 使用 VS Code Live Server 打开
1. 在 VS Code 中安装 **Live Server** 插件。
2. 在项目目录中右键 `index.html`。
3. 选择 **"Open with Live Server"**，浏览器将自动打开页面并支持热更新。

## 二、部署到静态站点

将以下文件上传到任意静态托管平台即可：

- `index.html`
- `manifest.json`
- `sw.js`
- `README.md`（可选）

支持的托管平台包括但不限于：
- GitHub Pages
- Vercel
- Netlify
- Nginx
- 阿里云 OSS / 腾讯云 COS 等对象存储

> 注意：部署时请确保 `manifest.json` 和 `sw.js` 与 `index.html` 位于同一目录，或正确配置 PWA 相关路径。

## 三、打包 HTML Zip

1. 进入 `web-demo/memorial-day-champion/` 目录。
2. 选中以下所有文件：
   - `index.html`
   - `manifest.json`
   - `sw.js`
   - `PRELIMINARY_SUBMISSION_README.md`
3. 将选中的文件压缩为 `.zip` 文件。
4. 确保 zip 包根目录直接包含上述文件，**不要嵌套多余文件夹**。

### Zip 文件清单

| 文件名 | 是否必选 | 说明 |
|---|---|---|
| `index.html` | **必选** | 主入口文件，不可遗漏 |
| `manifest.json` | PWA 必需 | PWA 应用清单，包含图标、名称等配置 |
| `sw.js` | PWA 必需 | Service Worker，支持离线缓存 |
| `PRELIMINARY_SUBMISSION_README.md` | 推荐 | 本说明文档 |

> ⚠️ **绝对不能遗漏的文件：`index.html`**。缺少该文件将导致 Demo 无法运行。

## 四、PWA 功能测试方法

### 测试 Manifest
1. 使用 Chrome 浏览器打开页面。
2. 按 `F12` 打开开发者工具。
3. 切换到 **Application** 标签页。
4. 左侧选择 **Manifest**。
5. 应正确显示应用图标、名称、主题色等信息，且无报错。

### 测试 Service Worker
1. 在 Chrome DevTools 中切换到 **Application** 标签页。
2. 左侧选择 **Service Workers**。
3. 应显示 `sw.js` 状态为 **activated** 或 **running**，表示已成功注册。
4. 可勾选 "Offline" 模拟离线，刷新页面验证离线可用。

## 五、能力说明（Mock vs 真实体验）

### Mock 能力（演示用，非真实实现）
以下功能为前端模拟演示，不具备真实后端能力：

- **Watch 表盘**：表盘界面为视觉 Mock，不连接真实 HarmonyOS 手表设备。
- **Dashboard 切换场景动画**：场景切换为预设动画效果，非真实数据驱动。
- **Agent 情感分析动画**：情感分析结果为预设动画展示，未接入真实情感分析模型。

### 真实可体验能力
以下功能为真实可用的前端能力，可直接体验：

- **语音识别**：基于 Web Speech API 实现，支持中文语音输入。
- **TXT 文件读取**：基于 FileReader API 实现，支持上传并读取 `.txt` 文件内容。
- **本地规则解析引擎**：纯前端规则引擎，可对上传文本进行解析和结构化提取。
- **提醒草稿勾选与复制 JSON**：支持勾选解析出的提醒项，一键复制为 JSON 格式。
- **PWA 安装**：支持添加到桌面，以独立应用窗口运行。
- **主题切换**：支持明暗主题切换，体验完整。

## 六、复赛继续完善方向

初赛版本为可体验的 Demo，复赛阶段计划从以下方向继续完善：

1. **接入真实大模型 API**：将本地规则引擎替换为真实大语言模型接口，提升解析准确率与自然语言理解能力。
2. **完整 PDF / DOCX 解析**：支持上传 PDF 和 Word 文档，实现多格式文件内容提取。
3. **HarmonyOS 原生 App 回灌**：开发 HarmonyOS 原生应用，实现与 Watch 表盘、手机端的深度联动。
4. **系统通知集成**：接入系统级通知能力，实现提醒事项的真实推送。
