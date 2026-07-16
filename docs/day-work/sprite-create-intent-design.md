# 时刻精灵创建意图与确认设计

## 边界

`src/assistant/sprite-create-intent.js` 是精灵入口适配层，不替代 `parseReminderText`。它只负责识别创建表达、移除命令外壳、保留日期时间、生成预览对象，并对无日期备忘做显式规范化。

## 路由顺序

1. 现有快捷动作：今天概览、搜索、页面、导出、主题和关注。
2. 明确创建表达：登记、记录、记一下、添加、创建、提醒、保存等。
3. 带日期时间的事项 fallback。
4. 明确动词触发的无日期备忘 fallback。
5. 真正无法理解时返回带示例的提示。

## 数据合同

输入“今天还有作业要做，帮我登记”时：

- `sourceText` 保留完整原句
- parser 输入为“今天作业”
- 预览为“事项：作业 / 日期：今天 / 时间：全天 / 类型：提醒”
- 确认前不写入

输入“帮我记一下买牛奶”时：

- `dateKey=null`
- `recordKind=note`
- 预览为“日期：未指定 / 时间：未指定 / 类型：备忘”

## 确认状态

- `renderPlan` 和 `renderDraft` 都用 `textContent` 展示用户内容。
- 创建计划显示“确认登记 / 修改 / 取消”。
- 修改会取消旧的通用计划并把焦点交回输入框；多轮草稿继续使用既有上下文修改逻辑。
- `executing` 在点击同步阶段立即置为 true，并禁用发送、确认、修改、取消按钮。
- 双击确认只进入一次执行路径。
- 取消和修改均不写入。

## 持久化

`create_record` 工具在 `saveParsedRecord` 成功后等待 `ShikeLocalFirst.persist(records)`。如果本地缓存写入明确失败，记录从内存回滚；如果 IndexedDB 持久化拒绝，记录从内存和缓存回滚并返回 `records_write_failed`，UI 不显示成功。

现有 IndexedDB 主仓库、localStorage 镜像、完整性分类、隔离区与 schema 均保留。

## 安全

- 输入上限仍为 500 字符。
- 用户内容不通过 `innerHTML` 输出。
- `<script>`、HTML 和 `javascript:` 文本不会执行。
- parser 核心未修改。
- 保存失败显示真实失败结果。

