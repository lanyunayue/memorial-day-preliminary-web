# v2.0.0-rc5.1 目录边界审计报告

## 审计时间
2026-07-12 15:00 (Asia/Shanghai)

## 审计背景
SHIKE v2.0.0-rc5 开发过程中，自动化子代理在写入 Web worktree 时发生目录越界，将 Web JS 文件错误写入了 `E:\lifetime`（用户的 HarmonyOS 工程目录）。

## 污染范围

### 确认的污染路径
1. `E:\lifetime\src\reminders\` — rc4 版本的提醒模块（5个文件）
2. `E:\lifetime\src\sync\` — rc5 版本的同步模块（5个文件）

### 污染文件清单（待 SHA-256 校验）
| 路径 | 与正确 worktree 一致性 | 备注 |
|------|----------------------|------|
| `src/reminders/reminder-engine.js` | 不一致（rc4 版本）| HarmonyOS 项目若有同名文件可能被覆盖 |
| `src/reminders/reminder-repository.js` | 不一致 | |
| `src/reminders/reminder-scheduler.js` | 不一致 | |
| `src/reminders/reminder-status.js` | 不一致 | |
| `src/reminders/calendar-bridge.js` | 不一致 | |
| `src/sync/device-identity.js` | 一致（rc5 版本）| |
| `src/sync/crypto-envelope.js` | 一致 | |
| `src/sync/sync-client.js` | 一致 | |
| `src/sync/sync-conflict.js` | 一致 | |
| `src/sync/sync-status.js` | 一致 | |

### 检查项
1. **是否仍有 rc5 Web 文件残留**：是，`E:\lifetime\src\reminders\` 和 `E:\lifetime\src\sync\` 存在
2. **是否覆盖过 HarmonyOS 文件**：待确认（取决于 HarmonyOS 工程是否有 src/reminders 或 src/sync 目录）
3. **是否只创建后又删除**：否，文件仍然存在
4. **目录修改时间**：待在清理脚本执行时记录
5. **是否存在其他误写文件**：未发现其他越界写入

### E:\lifetime Git 状态
- 本次审计未对 E:\lifetime 执行任何写操作或 git 操作
- 清理脚本仅提供 WhatIf 预览，不自动执行
- 用户需确认文件未被 HarmonyOS Git 跟踪后，手动带 `-Apply` 参数执行清理

## 清理策略
1. **不自动删除**：安全策略禁止本任务对 E:\lifetime 执行任何删除
2. **提供只读预览清理脚本**：`tools/cleanup-lifetime-web-contamination.ps1`
3. **默认 WhatIf 模式**：不带 `-Apply` 参数时仅输出待清理文件列表和 SHA
4. **仅针对已确认文件**：不递归清理未知目录
5. **安全检查**：如果文件被 Git tracked，脚本拒绝删除并提示用户

## 结论
目录越界是真实发生的 P0 事件。错误文件已识别，清理脚本已生成但未执行。
本补丁（rc5.1）不会修改 E:\lifetime 中的任何文件。
