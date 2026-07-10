# v1.3.2 桌面/移动卡片操作根因分析

**版本**: v1.3.2
**日期**: 2026-07-10
**基线**: v1.3.1 (commit 69f1bee)

## 问题 A：电脑端卡片操作堆积

### 根因
v1.0.0~v1.3.1 的卡片操作采用单一左滑交互模型：
- 所有设备统一使用 touch 事件驱动 translateX 显示操作栏
- 桌面端通过 .record-swipe:hover 尝试用 hover 模拟滑动
- 操作栏宽度固定 212px，按钮 flex-wrap 未严格禁止
- hover 展开造成布局跳动，多卡可同时展开
- 无键盘访问，无 aria-label

## 问题 B：移动端与电脑端交互不适配

未使用 (hover:hover)/(pointer:fine) vs (hover:none)/(pointer:coarse) 媒体特性区分。
混合设备（Surface/iPad）只按宽度判断导致交互错误。

## 问题 C：Agent 没有有效上下文

每轮独立路由，不读取上一轮 pending 状态；只识别显式命令；
无主动任务检测；无 anaphora 解析；conversation 历史未用于意图推断。

## 修复策略
- 桌面端改用"更多"按钮 + 绝对定位下拉菜单，swipe-actions display:none
- 移动端保留重构后的稳定 swipe，使用 pointer events 统一处理
- 新增 session-context.js 管理 pendingDraft/lastCreatedRecord 等状态
- 新增 proactive-task-detector.js 识别未来行动陈述
