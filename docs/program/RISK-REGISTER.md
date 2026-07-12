# RISK REGISTER

| ID | Severity | Risk | Evidence | Mitigation | Owner |
|---|---|---|---|---|---|
| R-001 | P1 | 真实浏览器 E2E 缺失 | 默认 e2e 为 SKIPPED | 执行 CDP/Playwright 7 视口 | Engineering |
| R-002 | P1 | origin/main 新鲜度未确认 | fetch 两次 connection reset | 网络恢复后重新 fetch | Engineering |
| R-003 | P1 | SKIPPED 可能被误计为 PASS | `test:e2e` exit 0 | 测试报告分类与 CI summary | QE |
| R-004 | P1 | CI install 失败被吞 | `npm ci || echo` | 改为有锁文件才 npm ci，否则 npm install/skip | QE |
| R-005 | P2 | Legacy 主体阻碍维护 | `legacy-app.js` 仍为主路径 | alpha3 解耦计划 | Engineering |
| R-006 | P2 | 云能力被误解 | 无真实云服务 | 文案和路线图明确关闭 | Product |
