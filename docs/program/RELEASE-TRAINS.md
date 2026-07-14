# RELEASE TRAINS

## Active

- v2.1.0-alpha2：Investment Hardening Final。

## Alpha2 Exit Criteria

1. 自评报告完成。
2. 完整 diff 审计完成。
3. CI 门禁真实性验证完成。
4. 真实浏览器证据完成，或明确只合并 CI 加固且不部署。
5. P0 = 0。
6. 未解决 P1 有书面豁免。
7. 不修改 `APP_VERSION` 和 `CACHE_NAME`，除非进入发布流程。

## Future

alpha3 只能在 alpha2 合并后从最新 main 创建。计划名：Core Reliability。不得提前创建 worktree 或分支。
