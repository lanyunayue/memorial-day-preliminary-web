# v1.3.2 Agent 上下文与主动待办识别设计

**版本**: v1.3.2
**日期**: 2026-07-10

## 模块结构

### 1. session-context.js
管理会话级状态，不修改 IndexedDB schema：
```
{
  recentTurns: [],           // 最近 10 条对话
  pendingDraft: null,        // 当前待确认草稿
  lastCreatedRecordId: null, // 最近创建的记录 ID
  lastCreatedRecordTitle: '',
  lastReferencedRecordId: null,
  lastReferencedTitle: '',
  inheritedDateKey: null,
  inheritedTime: null,
  inheritedTimePhrase: '',
  currentPage: 'home',
  currentDate: '',
  updatedAt: timestamp
}
```
- pending plan 30 分钟过期
- 清空对话时同步清空上下文
- 使用 localStorage 持久化（不改动 IndexedDB schema）

### 2. proactive-task-detector.js
主动任务识别器：
- 输入：用户文本 + 当前 context
- 输出：{isTask, confidence, title, dateKey, timeText, temporalPhrase, needClarification}
- detectModifyDraft()：处理多轮修改（"晚上八点吧"、"明天吧"、"改成复习英语"）

#### 识别维度
1. 将来时态词（待会、明天、今晚、下周、月底...）
2. 未完成状态（还没、还未）
3. 行动动词（写、做、交、复习、拿、打...）
4. 否定词过滤（不、不用、不需要、算了）
5. 已完成词过滤（已经、写完了、搞定了）
6. 疑问句过滤（吗、呢、什么、怎么）
7. 假设/条件过滤（如果、的话）
8. 闲聊过滤（你好、谢谢、随便说）

#### 置信度规则
- 0.9：明确未来时间 + 明确行动（"今晚要写作业"）
- 0.8：未完成状态（"作业还没写"）
- 0.7：有未来锚点
- 0.5：低置信度，触发澄清询问

#### "待会"处理
不伪造具体时间，dateKey=今天，timeText=null，temporalPhrase="待会"，
预览显示"时间：未指定（待会）"。

### 3. 多轮上下文流程
```
用户: 我待会还有作业要写
  → detect() 返回高置信度任务
  → 生成 pendingDraft，不写入
  → 回复预览询问确认

用户: 晚上八点吧
  → detectModifyDraft() 识别为时间修改
  → 更新同一 draft.timeText = "20:00"
  → 回复更新后的预览

用户: 确认
  → detectModifyDraft() 返回 {confirm:true}
  → 调用 create_record 工具写入 repository
  → 更新 lastCreatedRecordId
  → 清空 pendingDraft
```

### 4. Anaphora 解析
"它"、"那个"、"刚才那个" → ctx.lastReferencedRecordId || ctx.lastCreatedRecordId
执行前重新读取 repository 校验记录存在性。

### 5. 安全防护
- 确认前不静默写入
- 相同 requestId 幂等
- 过期 plan 不执行
- HTML 转义（使用 textContent 渲染）
- 清空对话同步清空上下文
- 删除/置顶操作执行前重新校验 recordId
