# OPERATING MODEL

## Cadence

- 每个 Active Release 必须有目标、非目标、证据清单、回滚策略。
- 每次提交前必须确认工作树、diff 范围和测试分类。
- 每次停止前必须区分 PASS、FAIL、SKIPPED 和 NOT RUN。

## Evidence Types

- STATIC：源码、HTML、CSS、manifest、SW 静态检查。
- UNIT：纯函数与小模块测试。
- INTEGRATION：多模块但非浏览器运行。
- LEGACY：现有回归套件。
- PARSER：自然语言解析专项。
- A11Y：静态无障碍与后续键盘/焦点检查。
- SECURITY：静态安全与后续威胁模型。
- BROWSER：真实浏览器或 CDP/Playwright。
- ONLINE：真实外部服务。
- OFFLINE：断网与缓存演练。
- SKIPPED：明确跳过，不计入通过。

## Escalation

P0 阻断合并和部署。P1 阻断部署，除非只合并纯 CI 加固且有明确豁免。P2 进入 backlog，不阻断当前 alpha2。
