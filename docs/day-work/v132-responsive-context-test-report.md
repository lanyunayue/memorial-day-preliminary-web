# v1.3.2 响应式卡片与 Agent 上下文测试报告

**版本**: v1.3.2
**测试日期**: 2026-07-10
**CACHE_NAME**: shike-v132-v51

## 测试套件

### 1. test-shike-record-actions-responsive.js (45项)
- 移动端 swipe rail 存在性
- 桌面端 more menu 存在性
- 桌面端不常驻 swipe rail (@media (hover:hover) and (pointer:fine) .swipe-actions{display:none})
- 移动端不常驻 desktop menu
- pointer fine/coarse 分支
- action rail nowrap
- 按钮固定尺寸 (min-width/min-height)
- 无危险负 margin
- transform 最大距离限制
- swipe threshold 16px
- vertical scroll 优先
- 一次只展开一张卡 (closeOpenMenus)
- 页面切换关闭
- 点击外部关闭
- pointercancel/touchcancel 处理
- Esc 键关闭菜单
- focus-visible 样式
- aria-label 完整性
- 编辑/置顶/取消置顶/删除/复制/.ics/纪念卡 操作存在
- 删除二次确认保留
- toast 保留
- 全部/今日/时间旅程/日历/搜索结果页面使用
- 无横向 overflow
- 深色主题样式
- reduced-motion 支持
- 版本号 v1.3.2
- cache shike-v132-v51
- 原 swipe 功能不退化
- 纳入回归套件

**结果**: 45/45 通过

### 2. test-shike-agent-context-proactive.js (65项)
- proactive-task-detector 模块存在
- session-context 模块存在
- "待会写作业" 识别
- "等下拿快递" 识别
- "今晚复习英语" 识别
- "明天交报告" 识别
- "周五考试" 识别
- 未完成状态识别
- 不识别已完成（昨天、已经写完）
- 不识别否定句、疑问句、假设句、闲聊
- 输出置信度/candidateTitle/dateKey
- "待会" 不伪造具体时间
- 保存原始时间短语
- 生成 pending draft
- 确认前不写入数据库
- "好"/"登记吧" 确认
- "算了" 取消不写入
- 双击确认不重复
- "明天吧"/"晚上八点" 更新当前草稿
- "改成复习英语" 更新标题
- "还有英语要复习" 生成第二候选
- "它" 引用最近创建记录
- "刚才那个" 引用 pending plan
- 删除/置顶引用重新校验
- pending plan 过期机制
- 清空对话清空上下文
- context 最多读取 10 条
- conversation 本地保存不上传
- IndexedDB repository 保留
- schema 不变（parser-adapter hash 校验）
- parser 核心不变
- sourceText 保留
- HTML 转义（使用 textContent）
- 超长输入限制
- 损坏 context 回退
- 今日概览/时间旅程/日历 dot 刷新
- 当前日期/页面进入 context
- 低/中/高置信度分级
- 不静默保存
- 明确创建意图仍可用
- 纳入回归套件

**结果**: 65/65 通过

### 3. 完整回归套件
包含原有测试（版本号、缓存名、swipe 距离更新到 v1.3.2 预期值）
+ 新增 2 项专项测试

**结果**: 57/57 通过

## Parser 完整性
parser-adapter.js hash 与 v1.3.1 基线一致，核心解析逻辑未改动。

## Schema 完整性
IndexedDB schema 未变更，session-context 使用 localStorage 独立存储。
