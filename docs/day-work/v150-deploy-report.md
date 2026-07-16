# v1.5.0 部署报告

部署日期：2026-07-11

## 版本

- 正式版本：`v1.5.0`
- Service Worker：`shike-v150-v54`
- 产品 commit：`f91ef43a22799fdeee20fe0a6f0d52471c3e3043`
- 发布审计 commit：`1d4dc75a04005b6304cbb9a2a2b3c8377489ffb9`
- 发布前 main：`afa00169eefc4b8276f4d1ae1746890b164976c9`
- 回滚 tag：`shike-web-stable-before-v150-bear-workbench`，目标 `afa00169eefc4b8276f4d1ae1746890b164976c9`

## Git 操作

- 候选分支 `rematch-v150-bear-workbench` 已推送。
- `origin/main` 通过普通 fast-forward 从 `afa0016` 更新到 `1d4dc75`。
- 未 force push。
- 未修改 `gh-pages`。
- 未从脏的 `E:\lifetime-web` 发布。
- `E:\lifetime` 未修改。

## GitHub Pages

- Workflow：`pages build and deployment`
- Run ID：`29141210895`
- 结果：`completed / success`
- Workflow：<https://github.com/lanyunayue/memorial-day-preliminary-web/actions/runs/29141210895>
- 正式根地址：<https://lanyunayue.github.io/memorial-day-preliminary-web/>

线上直接读取结果：

- 根地址 HTTP 200。
- `src/config/version.js` HTTP 200，包含 `APP_VERSION='v1.5.0'`。
- `sw.js` HTTP 200，包含 `CACHE_NAME = 'shike-v150-v54'`。
- `src/retrieval/retrieval-engine.js` HTTP 200。

## 线上验收

- Edge 完整体验：33/33。
- 代表视口：360、375、390、414、768、1024、1366、1440、1920；无横向溢出。
- 知识检索：GitHub 5 条真实来源。
- 天气检索：Open-Meteo 1 条，包含 CC BY 4.0 署名。
- 关注中心：5 条真实 GitHub 内容。
- 知识问答前后记录数量不变。
- 危险 RSS 协议被拒绝。
- 线上预热后离线启动：3/3。
- 本地完整 12 视口 bounding-box：12/12，WebGL 非空像素通过。

线上截图位于：

`E:\lifetime-web-audit-artifacts\v150-bear-workbench\screenshots-v150-online-experience`

## 结论

v1.5.0 已成功部署到正式根地址。回滚 tag 已存在；当前未发现需要回滚的问题。
