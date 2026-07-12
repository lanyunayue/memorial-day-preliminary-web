# DECISION LOG

| ID | Date | Decision | Evidence | Consequence |
|---|---|---|---|---|
| D-0001 | 2026-07-12 | alpha2 只作为投资级质量门禁加固阶段 | self-evaluation 为 CONDITIONAL PASS | 不部署，不改版本，不改缓存 |
| D-0002 | 2026-07-12 | 默认 e2e SKIPPED 不计为浏览器通过 | `npm run test:e2e` 输出 skipped | 报告与 PR 必须单独列 SKIPPED |
| D-0003 | 2026-07-12 | 不提前创建 alpha3 | alpha2 未闭环 | 后续可靠性工作等待 alpha2 合并 |
