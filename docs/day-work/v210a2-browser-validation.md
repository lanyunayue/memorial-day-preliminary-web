# v2.1.0-alpha2 Browser Validation

时间：2026-07-13 00:03 +08:00

## 结论

真实 Edge/CDP 已执行，但 alpha2 浏览器验收尚未完整完成。

- Runtime CDP：PASS，11/11。
- Layout baseline CDP：PASS，9/9。
- Playwright Chromium：NOT RUN。
- 权限拒绝、离线启动、Service Worker 更新、备份错误密码导入、回收站恢复、快照恢复：NOT RUN。

因此，本报告不能作为“完整 E2E 通过”或“允许部署”的依据，只能作为真实浏览器部分证据。

## 浏览器信息

- Browser：Edg/150.0.4078.65。
- Protocol：1.3。
- CDP URL：`http://127.0.0.1:9474`。
- App URL：`http://127.0.0.1:8766/`。
- Edge path：`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`。
- 启动参数：`--remote-debugging-port=9474 --remote-allow-origins=* --user-data-dir="<temp profile>" --no-first-run --disable-extensions --new-window http://127.0.0.1:8766/`。

## 执行结果

1. `node scripts/test-shike-runtime-cdp.js`
   - 结果：`Runtime CDP acceptance passed: 11/11`。
   - 覆盖：页面加载、版本、unsaved guard、产品表面、横向溢出、演示入口、batch/demo、背景/天气/语言切换、console/runtime error。

2. `node scripts/test-shike-experience-runtime-cdp.js` with `SHIKE_LAYOUT_ONLY=1`
   - 结果：`Experience baseline layout capture completed: 9/9`。
   - 视口：360x640、375x667、390x844、414x896、768x1024、1024x768、1366x768、1440x900、1920x1080。
   - 每个视口：初始滚动为 0，无横向溢出，storage ready，opening hidden。

## 产物

本地产物未提交，避免把截图和临时验证日志混入代码分支。

- `artifacts/v210a2/browser/browser-metadata.json`
- `artifacts/v210a2/browser/experience-runtime-result.json`
- `artifacts/v210a2/browser/v141-home-*.png`
- `test-results/v210a2/runtime-cdp.log`
- `test-results/v210a2/layout-cdp.log`

## 未覆盖清单

- Playwright Chromium 未执行。
- 通知权限拒绝未执行。
- 麦克风拒绝未执行。
- ICS 浏览器导出未执行。
- 离线启动未执行。
- Service Worker 更新演练未执行。
- 键盘焦点顺序未执行。
- reduced-motion 未执行。
- 回收站恢复未执行。
- 快照恢复未执行。
- 备份错误密码导入未执行。

## 发布判定

- 合并：只可作为 CI/质量门禁加固分支继续评审。
- 部署：不允许。
- 版本：未修改。
- 缓存：未修改。

## Investment Hardening Follow-up

时间：2026-07-13 00:30 +08:00

新增的 CI 等价强制路径 `npm run test:e2e:ci` 已在真实 Edge 上通过：

- Browser：Edg/150.0.4078.65，Protocol 1.3。
- Runtime：PASS，11/11。
- 视口：375、390、414、768、1024、1366、1440，共 7/7。
- 截图：7 张，截图前恢复首页基线状态。
- Console/runtime/log/network errors：0。
- required 模式下 SKIPPED：非零退出，不能计为 PASS。
- 自动启动：PASS；runner 使用异步子进程，避免本地静态服务器事件循环被阻塞。

证据路径：

- `artifacts/ci-e2e/browser-metadata.json`
- `artifacts/ci-e2e/runtime-result.json`
- `artifacts/ci-e2e/e2e-runner-result.json`
- `artifacts/ci-e2e/home-*.png`

本次补强完成 `SHIKE-A2-001` 的核心浏览器门禁，但不改变原报告的部署判定。离线启动、Service Worker 更新、权限拒绝、回收站/快照/错误密码恢复仍未执行，完整 alpha2 发布验收仍为 NOT COMPLETE。
