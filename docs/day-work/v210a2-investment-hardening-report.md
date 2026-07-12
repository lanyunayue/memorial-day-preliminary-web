# v2.1.0-a2 投资级质量门禁加固报告

更新时间：2026-07-12 22:31 +08:00

## 工作边界

- 本轮在独立 worktree `E:\lifetime-web-v210a2-investment-hardening` 执行。
- 分支：`program-v210a2-investment-hardening`。
- 基线：`origin/main` / `693c63b report navigation consolidation deployment`。
- 已发现 `E:\lifetime-web` 和 `E:\lifetime-web-v210a1-core-truth` 存在既有未提交改动，本轮没有触碰或回退这些 worktree。

## 发现的问题

1. `npm run test:a11y` 的旧 runner 会打印无障碍问题，但固定退出 `0`，不能作为真实质量门禁。
2. `npm run test:e2e` 在无 Playwright 环境下会运行陈旧的 browser-free/CDP 脚本，出现失败输出但仍退出 `0`，容易造成“看似通过”的误判。
3. 确认弹窗两个按钮在静态 HTML 中没有初始可访问名称，严格 a11y 静态检查会报告问题。

## 已完成加固

1. `index.html`
   - 给确认弹窗取消/确定按钮补充静态 `aria-label`。
   - 未改产品布局、主题、首页结构或版本号。

2. `scripts/test-a11y-runner.js`
   - 优先委托现有严格静态检查 `scripts/test-shike-a11y-static.js`。
   - 回退检查发现问题时退出 `1`，不再失败后仍返回成功。

3. `scripts/test-e2e-runner.js`
   - 保留 Playwright 优先路径。
   - 无 Playwright 且未配置 `SHIKE_CDP_URL` 时明确跳过并说明如何启用浏览器验证。
   - 配置 `SHIKE_CDP_URL` 时运行当前可用的 `test-shike-runtime-cdp.js`。
   - 支持 `SHIKE_AUTOSTART_EDGE=1` 尝试本机 Edge/CDP 启动。
   - 移除默认调用陈旧 v1.5.0 responsive/network CDP 脚本的路径，避免失真失败。

4. `scripts/format-check.js`
   - 发现格式问题时退出 `1`，不再固定退出 `0`。

5. `.github/workflows/ci.yml`
   - 移除 lint/format 的 `continue-on-error`。
   - 增加 a11y 和 e2e runner smoke 步骤。

6. `package.json`
   - `test:all` 扩展为 lint、format、unit、legacy、a11y、security、e2e runner smoke 的统一入口。

## 验证记录

- `npm run format:check`：先发现 7 个 `src` 长行；已通过只换行/拆块修复，复跑通过。
- `npm run test:a11y`：通过，`A11y static regression passed: 6/6`。
- `npm run test:e2e`（无 CDP）：通过，明确跳过浏览器验证并提示配置方式。
- `npm run test:e2e`（外部 Edge CDP）：通过，`Runtime CDP acceptance passed: 11/11`，`E2E (CDP): 1 passed, 0 failed`。
- `npm run test:all`：通过，现已包含 lint、format、unit、legacy、a11y、security、e2e runner smoke。
  - Unit：9 passed。
  - Legacy：66/66 passed。
  - Security：passed。
  - Lint：passed。

## 未做事项

- 未做产品功能改造。
- 未改 UI 风格。
- 未更新 `APP_VERSION` / `APP_UPDATED_AT`。
- 未更新 `sw.js` cache。
- 未部署生产环境。

## 当前结论

本轮属于低风险质量门禁加固：把原本会“失败但返回成功”的 a11y/e2e 检查改成更诚实的执行路径，并修复一个静态无障碍问题。适合作为后续 v2.1.0 开发前的质量基础，但还不是正式发布版本。
