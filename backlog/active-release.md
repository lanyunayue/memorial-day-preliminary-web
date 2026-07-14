# Active Release

Release：v2.1.0-alpha2 Investment Hardening Final

## Active Items

- `SHIKE-A2-002`：CI 门禁真实性。实现与本地回归完成，等待远端 GitHub Actions 证据。

## Completed Items

- `SHIKE-A2-001`：真实 Edge/CDP 核心门禁通过，11/11、7 视口、7 截图、console/network 零错误。
- `SHIKE-A2-003`：测试真实性扫描器不再自我 allowlist，不再用常量真断言计数；630/630。

## Exit Criteria

- P0 = 0。
- P1 either fixed or explicitly waived for CI-only merge.
- Browser evidence complete, or merge limited to CI hardening with no deploy.
- No version/cache change.
- No alpha3 branch.
