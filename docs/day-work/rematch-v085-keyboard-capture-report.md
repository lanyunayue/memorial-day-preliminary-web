# 时刻 v0.8.5 Keyboard Capture 候选报告

## 结论

v0.8.5 是 v0.8.4 smart capture 的小范围交互收尾：让保存前解析预览支持键盘优先操作，减少用户从键盘切到鼠标的打断。

## 工作区

D:\lifetime-v085-keyboard-capture

## 分支

rematch-v085-keyboard-capture

## 基线

main：81bf12a4da9ccc85d20f9accd037d1efe81bc82a

线上基线：v0.8.4 / shike-v084-v30

## 实现 commit

b8e028c5b346b9cd3d3be7c53dcc3d4cd1763b35

## 版本

- APP_VERSION：v0.8.5
- APP_UPDATED_AT：2026-07-09 11:35
- sw.js cache：shike-v085-v31

## 修改文件

- index.html
- sw.js
- scripts/test-shike-time-sprite.js
- scripts/test-shike-backup-hardening.js
- scripts/test-shike-regression-suite.js
- scripts/test-shike-keyboard-capture.js

## 功能变化

1. 当解析预览已经匹配当前输入时，按 Enter 直接确认创建。
2. 当没有现成预览时，按 Enter 仍先打开解析预览。
3. Ctrl+Enter / Command+Enter 直接保存，绕过解析预览。
4. Esc 关闭当前解析预览，不保存。
5. “直接保存”按钮改为调用直存逻辑，不再等同于“确认创建”。
6. Shift+Enter 保持多行输入能力。

## 不变项

- 不改 parser。
- 不改 NLP 规则。
- 不改 UI 主题。
- 不改响应式布局。
- 不改体验示例。
- 不引入后端、登录、云同步、数据库或外部 API。

## 测试命令

```powershell
node scripts/test-shike-keyboard-capture.js
node scripts/test-shike-time-sprite.js
node scripts/test-shike-backup-hardening.js
node scripts/test-shike-regression-suite.js
```

## 测试结果

- Keyboard capture：7/7 通过
- Time sprite：8/8 通过
- Backup hardening：11/11 通过
- Clean candidate suite：21/21 通过

## 本地浏览器验收

Headless Edge 本地验收：13/13 通过。

覆盖：

- v0.8.5 加载
- 375px 无横向溢出
- 输入后自动出现解析预览
- Enter 确认已有预览并保存
- 保存后预览清空
- Esc 清空预览且不保存
- Ctrl+Enter 直接保存
- 直接保存后预览清空
- 1366px 无横向溢出
- 无明显 JavaScript 错误

## 风险

风险较低。改动只在输入框键盘事件和解析预览保存路径上，不影响 parser 与数据结构。

需要注意：如果用户输入后等待了自动预览出现，再按 Enter 会直接保存。这是本轮目标行为。

## 回滚

如需回滚候选分支：

```powershell
git switch main
git branch -D rematch-v085-keyboard-capture
```

如已上线后需回滚，应先创建上线前备份 tag，再回滚到 v0.8.4 稳定点。

## 是否建议上线

建议上线。该改动让 v0.8.4 的智能录入从“可用”变为“更顺手”，同时范围很小，测试覆盖明确。
