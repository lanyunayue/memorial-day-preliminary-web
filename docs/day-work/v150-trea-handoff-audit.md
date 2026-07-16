# v1.5.0 TREA 交接审计

审计日期：2026-07-11
目标工作区：`E:\lifetime-web-v150-bear-workbench`
目标分支：`rematch-v150-bear-workbench`

## 结论

指令描述中的 v1.5.0 worktree、分支和 `src/assistant/bear-state-machine.js` 在当前磁盘与 Git 引用中均不存在。为避免污染 `E:\lifetime-web` 的既有脏工作区，已从干净的 `origin/main@afa00169eefc4b8276f4d1ae1746890b164976c9` 重建独立 worktree 与分支。重建后工作区在本报告写入前无产品差异。

## TREA 已修改文件

未发现可归属于 TREA 的 v1.5.0 文件或提交。以下交接目标文件均为 v1.4.1 稳定基线内容：

- `src/config/version.js`
- `sw.js`
- `index.html`
- `assets/styles/app.css`
- `src/legacy-app.js`
- `src/agent/agent-core.js`
- `src/agent/ui.js`
- `src/agent/intent-router.js`
- `src/agent/tools/tool-definitions.js`
- `scripts/`

`src/assistant/bear-state-machine.js` 不存在。

## 已完成内容

稳定基线已经包含：

- v1.4.1 响应式容器规则，768px、1024px、1280px 有放宽断点。
- 2.5D CSS 小熊、悬浮入口、基础拖动和折叠面板。
- 本地 Agent 工具链、确认策略、会话历史与基础工作台。
- 本地关注中心、关键词与公开条目存储基础。
- Service Worker 与 PWA 离线资产缓存。

## 可保留内容

- 现有 2.5D 小熊 DOM/CSS 造型和品牌视觉。
- Agent 的安全策略、确认策略、工具注册、执行器和会话仓库。
- watch storage/center 的本地数据边界。
- v1.4.1 的移动端布局、底部导航和既有功能行为。
- 现有模块化脚本加载顺序和无构建部署方式。

## 需要修复内容

- 桌面端需要从“放宽单列容器”升级为主内容加右侧工作台的自适应网格。
- 小熊缺少统一状态机、状态可访问性和 Agent 生命周期联动。
- 工作台仍是小型 `<details>`，对话区高度仅 150px，不能承载完整问答和来源展示。
- 缺少声音、语音、精灵定制和可选 3D 的隔离实现。
- Agent 仅支持本地操作，没有公开来源检索、结果归一化、排序、提取式总结和诚实降级。
- 关注中心需要真实公开来源适配器、自定义 RSS 校验和失败状态。

## 缺失模块

- `src/assistant/bear-state-machine.js`
- `src/assistant/sprite-customization.js`
- `src/assistant/sprite-renderer-2d.js`
- `src/assistant/sprite-renderer-3d.js`
- `src/assistant/sprite-audio.js`
- `src/retrieval/query-classifier.js`
- `src/retrieval/provider-registry.js`
- `src/retrieval/retrieval-engine.js`
- `src/retrieval/result-normalizer.js`
- `src/retrieval/result-ranker.js`
- `src/retrieval/extractive-summarizer.js`
- `src/retrieval/source-cache.js`
- `src/retrieval/search-fallback.js`

## 工作区与数据边界

- 未提交代码：本报告写入前无未提交产品代码；仅本报告是新增审计产物。
- parser：相对 `origin/main` 无变化。
- record schema：相对 `origin/main` 无变化，v1.5.0 不应修改记录 schema。
- `E:\lifetime-web`：未作为开发或发布目录，既有脏文件未复制。
- `E:\lifetime`：未修改。
- 远端：未 push、未 deploy、未修改 main 或 gh-pages。

## 后续实施原则

在现有 v1.4.1 稳定模块上增量实现。先建立状态机、工作台壳层和响应式布局，再接入纯前端检索与关注中心；所有联网结果必须显示来源，失败必须诚实降级。每个阶段保持 parser 与记录 schema 哈希不变，并通过回归、离线和真实视口检查后再进入发布判断。
