# PROJECT CHRONOS 演示入口

## 推荐真实使用路径

1. 打开 `/index.html?capture=1`，在“时刻”输入并保存自己的真实事项。
2. 点击“把我的事项带进归时谷”，进入 `/competition.html`。
3. 确认页面显示“真实使用 · 本机事项”，再进入可行走、可交互的 3D 归时谷。
4. 在右侧面板点击事项，选择拆分、延期、今天不处理或放下。
5. 点击“返回时刻”并“应用到时刻”；拆分结果会生成真实子事项，其他选择会写回原记录。

## 推荐答辩演示路径（约 2 分钟）

没有准备个人数据时，可从 `/competition.html?demo=competition` 启动固定的三事项演示。页面会明确标注“演示模式”，不会与真实使用入口混淆。

## 页面用途

- `/showcase.html`：项目官网 / 评委第一印象
- `/competition.html`：真实事项交接入口
- `/competition.html?demo=competition`：固定数据演示入口
- `/index.html`：原始主应用入口
- `/valley/`：归时谷核心体验

## 本地启动

```powershell
npm run serve
```

默认地址：`http://127.0.0.1:4178/showcase.html`

## 演示原则

- 无需注册，不依赖远程服务。
- 演示数据仅保存在当前设备的 `localStorage`。
- 每轮使用独立 transferId，返回结果只应用一次；拆分结果会写回“时刻”。
- 建议用 1440×900 或 1920×1080 全屏展示；移动端同样可用。
