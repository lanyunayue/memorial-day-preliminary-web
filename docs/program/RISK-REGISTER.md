# RISK REGISTER

| ID | Severity | Risk | Evidence | Mitigation | Owner |
|---|---|---|---|---|---|
| R-001 | P1 | 完整发布浏览器证据仍缺离线、SW、权限与恢复演练 | 核心 Edge/CDP 11/11 与 7 视口已 PASS | 部署前完成 `SHIKE-A2-004`，当前禁止部署 | Engineering |
| R-002 | Resolved | origin/main 新鲜度未确认 | `git fetch origin --prune` 成功，`origin/main=693c63b` | 每次交付前继续 fetch | Engineering |
| R-003 | Resolved | SKIPPED 可能被误计为 PASS | required E2E 对 SKIPPED 非零退出，回归 4/4 | CI 使用 `test:e2e:ci` | QE |
| R-004 | Resolved | CI install 失败被吞 | `ci:install` 对有依赖无锁文件明确失败 | CI 禁止 `npm ci || echo` | QE |
| R-005 | P2 | Legacy 主体阻碍维护 | `legacy-app.js` 仍为主路径 | alpha3 解耦计划 | Engineering |
| R-006 | P2 | 云能力被误解 | 无真实云服务 | 文案和路线图明确关闭 | Product |
