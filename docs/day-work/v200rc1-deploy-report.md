# v2.0.0-rc1 部署报告

## 部署信息
- 部署时间: 2026-07-11T07:54:38.517Z
- 版本: v2.0.0-rc1
- Cache: shike-v200rc1-v55
- 产品Commit: 99a2d2e (release v2.0.0-rc1)
- 基线: 4d58580 (v1.5.0 最终稳定)
- 回滚Tag: shike-web-stable-before-v200rc1-release (指向4d58580)
- 部署方式: 快进推送 rematch-v200rc1-release:main
- 部署地址: https://lanyunayue.github.io/memorial-day-preliminary-web/

## 线上验证
- HTTP 200: ✅
- APP_VERSION: v2.0.0-rc1 ✅
- CACHE_NAME: shike-v200rc1-v55 ✅
- 新模块HTTP 200: ✅ (bear-state-machine.js, watch-storage.js, watch-center.js)
- GitHub Pages workflow: 成功

## 部署内容
1. 版本升级至v2.0.0-rc1
2. 缓存升级至shike-v200rc1-v55
3. 工程化基础设施 (package.json, playwright.config.js, vitest.config.js, eslint.config.js)
4. CI配置 (.github/workflows/ci.yml, 最小权限contents:read)
5. 测试runner脚本 (lint, format, unit, e2e, a11y, security)
6. v2.0.0-rc1专项测试 (57项)
7. 基线审计文档
8. 可访问性审计文档
9. 安全审计文档
10. 性能审计文档
11. 检索来源治理文档
12. 测试报告
13. 运行态报告
14. releaseCenterV200rc1 i18n (4语言)
15. capabilityV200rc1 功能标记

## 测试结果
- 旧回归: 58/58 ✅
- v2.0.0-rc1专项: 57/57 ✅
- parser hash: d6298d52d56beddf... (未改变) ✅
- 数据schema: 未改变 ✅

## 回滚方案
```
git checkout shike-web-stable-before-v200rc1-release
git push origin HEAD:main --force-with-lease
```
(注意: 正常部署不使用force push，仅在紧急回滚时使用)
