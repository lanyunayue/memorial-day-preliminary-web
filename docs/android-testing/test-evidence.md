# Android Alpha 测试证据

证据由 `scripts/android-audit.ps1` 生成并刷新。当前测试边界：

- JVM：EventEnvelope、解析、承运商、取件码、状态、去重、脱敏、策略、助手与任意 Unicode 输入。
- Corpus：`synthetic-template` 和 `sanitized-example`，不包含 `human-reviewed` 或 `real-device-consented` 冒充数据。
- Android unit：模式和白名单撤销。
- Instrumentation：Room、Keystore 密文检查、清除、原生 Compose 引导。
- 真实通知与真实设备：尚未执行，见 `real-device-validation.md`。

HTML/XML 报告生成在各模块 `build/reports/tests` 与 `build/test-results`，属于本地构建产物，不提交 Git。
