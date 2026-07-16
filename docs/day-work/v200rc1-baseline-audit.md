# v2.0.0-rc1 基线审计报告

生成时间: 2026-07-11T07:13:15.423Z
审计目录: E:/lifetime-web-v200rc1-release
基线commit: 4d58580da85a04883ed68cf3933b0b33811f26b1
origin/main: 4d58580da85a04883ed68cf3933b0b33811f26b1

---

## 1. Git状态

- 当前分支: `rematch-v200rc1-release`
- HEAD: `4d58580da85a04883ed68cf3933b0b33811f26b1`
- origin/main: `4d58580da85a04883ed68cf3933b0b33811f26b1`
- 工作区状态:
```
(clean)
```
- 最近5个commit:
```
4d58580 report v1.5.0 deployment
1d4dc75 report v1.5.0 release audit
f91ef43 build v1.5.0 adaptive bear workbench
afa0016 report v1.4.1 experience deployment
8e9fae0 report v1.4.1 experience stabilization candidate
```

## 2. 版本信息

- APP_VERSION: **v1.5.0**
- CACHE_NAME: **shike-v150-v54**
- version.js 大小: undefined bytes

## 3. Parser完整性

- parser-adapter.js SHA-256: `d6298d52d56beddfc407b329569fe81f179fcf50652425ed29dda6fa6eb6be32`
- parser-adapter.js 行数: 5
- parseReminderText 存在: 是

**注意**: 本阶段不得修改parser核心hash。

## 4. 数据Schema与存储

- IndexedDB名称: `unknown`
- IndexedDB版本: 0
- Object Stores: (none found)
- localStorage Keys: shike_assistant_collapsed, shike_sprite_pos, shike_sprite_collapsed, shike_sprite_last_tip, shike_demo_route_collapsed, shike_seen_release_note_version, shike_last_backup_at, shike_local_db

## 5. Service Worker

- CACHE_NAME: shike-v150-v54
- 预缓存文件数: 71
- 预缓存列表:
  - `./index.html`
  - `./manifest.json`
  - `./assets/styles/app.css`
  - `./src/config/release-notes.js`
  - `./src/config/version.js`
  - `./src/config/constants.js`
  - `./src/utilities/sanitize.js`
  - `./src/utilities/ids.js`
  - `./src/storage/legacy-storage.js`
  - `./src/storage/data-integrity.js`
  - `./src/storage/indexeddb-storage.js`
  - `./src/storage/local-first-bridge.js`
  - `./src/legacy-app.js`
  - `./src/app.js`
  - `./src/core/event-bus.js`
  - `./src/core/state.js`
  - `./src/core/errors.js`
  - `./src/core/router.js`
  - `./src/storage/repository.js`
  - `./src/storage/migrations.js`
  - `./src/storage/backup.js`
  - `./src/records/record-service.js`
  - `./src/records/record-normalizer.js`
  - `./src/records/dedupe.js`
  - `./src/records/recurrence.js`
  - `./src/parser/parser-adapter.js`
  - `./src/calendar/calendar-service.js`
  - `./src/calendar/ics-export.js`
  - `./src/views/view-registry.js`
  - `./src/components/legacy-components.js`
  - `./src/i18n/index.js`
  - `./src/utilities/dates.js`
  - `./src/utilities/clipboard.js`
  - `./src/utilities/downloads.js`
  - `./src/assistant/sprite-create-intent.js`
  - `./src/assistant/bear-state-machine.js`
  - `./src/assistant/sprite-customization.js`
  - `./src/assistant/sprite-renderer-2d.js`
  - `./src/assistant/sprite-renderer-3d.js`
  - `./src/assistant/sprite-audio.js`
  - `./src/agent/namespace.js`
  - `./src/agent/safety-policy.js`
  - `./src/agent/confirmation-policy.js`
  - `./src/agent/intent-router.js`
  - `./src/agent/context-builder.js`
  - `./src/retrieval/query-classifier.js`
  - `./src/retrieval/provider-registry.js`
  - `./src/retrieval/result-normalizer.js`
  - `./src/retrieval/result-ranker.js`
  - `./src/retrieval/extractive-summarizer.js`
  - `./src/retrieval/source-cache.js`
  - `./src/retrieval/search-fallback.js`
  - `./src/retrieval/browser-ai.js`
  - `./src/retrieval/providers/wikipedia.js`
  - `./src/retrieval/providers/wikidata.js`
  - `./src/retrieval/providers/github.js`
  - `./src/retrieval/providers/stackexchange.js`
  - `./src/retrieval/providers/open-meteo.js`
  - `./src/retrieval/retrieval-engine.js`
  - `./src/agent/proactive-task-detector.js`
  - `./src/agent/session-context.js`
  - `./src/agent/tool-registry.js`
  - `./src/agent/tools/tool-definitions.js`
  - `./src/agent/planner.js`
  - `./src/agent/executor.js`
  - `./src/agent/conversation-repository.js`
  - `./src/agent/result-formatter.js`
  - `./src/agent/agent-core.js`
  - `./src/agent/ui.js`
  - `./src/watch/watch-storage.js`
  - `./src/watch/watch-center.js`

## 6. 页面列表

- `page-watch`

## 7. Agent工具列表

- `create_record`
- `edit_record`
- `delete_record`
- `pin_record`
- `search_records`
- `summarize_today`
- `open_page`
- `batch_parse`
- `export_calendar`
- `export_backup`
- `change_theme`
- `show_release_notes`
- `manage_subscription`

## 8. 检索Provider

- 检索引擎: 存在
- RSS支持: 不存在
- 检索模块文件:
  - `browser-ai.js`
  - `extractive-summarizer.js`
  - `provider-registry.js`
  - `github.js`
  - `open-meteo.js`
  - `stackexchange.js`
  - `wikidata.js`
  - `wikipedia.js`
  - `query-classifier.js`
  - `result-normalizer.js`
  - `result-ranker.js`
  - `retrieval-engine.js`
  - `search-fallback.js`
  - `source-cache.js`

## 9. 精灵/助手模块

- 2D渲染: 存在
- 3D渲染: 存在
- 音频模块: 存在
- 外观定制: 存在
- 小熊状态机: 存在
- assistant文件:
  - `bear-state-machine.js`
  - `sprite-audio.js`
  - `sprite-create-intent.js`
  - `sprite-customization.js`
  - `sprite-renderer-2d.js`
  - `sprite-renderer-3d.js`

## 10. 测试脚本

共 67 个旧测试脚本:
- `test-shike-a11y-static.js`
- `test-shike-agent-confirmation.js`
- `test-shike-agent-context-proactive.js`
- `test-shike-agent-conversation.js`
- `test-shike-agent-core.js`
- `test-shike-agent-runtime-cdp.js`
- `test-shike-agent-security.js`
- `test-shike-agent-tools.js`
- `test-shike-backup-hardening.js`
- `test-shike-batch-capture-inbox.js`
- `test-shike-batch-dedupe.js`
- `test-shike-batch-save-feedback.js`
- `test-shike-card-export.js`
- `test-shike-correction-chips.js`
- `test-shike-corruption-quarantine.js`
- `test-shike-data-integrity.js`
- `test-shike-data-safety-center.js`
- `test-shike-demo-examples.js`
- `test-shike-demo-route.js`
- `test-shike-draft-edit-handoff.js`
- `test-shike-draft-existing-dedupe.js`
- `test-shike-example-chips.js`
- `test-shike-experience-runtime-cdp.js`
- `test-shike-feature-hub-cleanup.js`
- `test-shike-feedback-entry.js`
- `test-shike-home-initial-layout.js`
- `test-shike-home-simplification.js`
- `test-shike-html-integrity.js`
- `test-shike-i18n-placeholders.js`
- `test-shike-ics-deep.js`
- `test-shike-ics-export.js`
- `test-shike-import-graph.js`
- `test-shike-import-preview.js`
- `test-shike-indexeddb-repository.js`
- `test-shike-keyboard-capture.js`
- `test-shike-later-inbox.js`
- `test-shike-module-boundaries.js`
- `test-shike-my-page-priority.js`
- `test-shike-offline-assets.js`
- `test-shike-offline-runtime-cdp.js`
- `test-shike-parse-preview.js`
- `test-shike-pwa-assets.js`
- `test-shike-pwa-notice.js`
- `test-shike-record-actions-polish.js`
- `test-shike-record-actions-responsive.js`
- `test-shike-regression-suite.js`
- `test-shike-release-feedback-center.js`
- `test-shike-release-notes.js`
- `test-shike-responsive-css.js`
- `test-shike-runtime-cdp.js`
- `test-shike-sprite-assistant-2.js`
- `test-shike-sprite-create-intent.js`
- `test-shike-sprite-upgrade.js`
- `test-shike-storage-migration.js`
- `test-shike-storage-runtime-cdp.js`
- `test-shike-swipe-actions.js`
- `test-shike-time-sprite.js`
- `test-shike-timeline.js`
- `test-shike-today-overview.js`
- `test-shike-unsaved-work-guard.js`
- `test-shike-v100-stable.js`
- `test-shike-v100rc-release.js`
- `test-shike-v150-bear-workbench.js`
- `test-shike-v150-network-cdp.js`
- `test-shike-v150-responsive-cdp.js`
- `test-shike-v2-backup.js`
- `test-shike-watch-center.js`

## 11. 文件大小

- index.html: undefined bytes
- JS总大小: NaN bytes (NaN KB)
- CSS总大小: NaN bytes (NaN KB)
- sw.js: undefined bytes

## 12. 安全扫描

- 疑似API Key泄露: **未发现**
- 临时文件/Profile: **未发现**
- 外部URL:
  - `src\agent\ui.js`: https://www.bing.com/search?q=
  - `src\legacy-app.js`: https://api.open-meteo.com/v1/forecast?latitude=
  - `src\retrieval\providers\github.js`: https://api.github.com/search/repositories?q=
  - `src\retrieval\providers\open-meteo.js`: https://geocoding-api.open-meteo.com/v1/search?count=1&language=zh&format=json&name=, https://api.open-meteo.com/v1/forecast?latitude=, https://open-meteo.com/
  - `src\retrieval\providers\stackexchange.js`: https://api.stackexchange.com/2.3/search/advanced?site=stackoverflow&order=desc&sort=relevance&pagesize=5&filter=withbody&q=
  - `src\retrieval\providers\wikidata.js`: https://www.wikidata.org/w/api.php?action=wbsearchentities&search=, https://www.wikidata.org/wiki/
  - `src\retrieval\providers\wikipedia.js`: https://zh.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=, https://zh.wikipedia.org/?curid=
  - `src\retrieval\search-fallback.js`: https://www.bing.com/search?q=, https://www.baidu.com/s?wd=, https://www.google.com/search?q=
  - `src\watch\watch-center.js`: https://example.com/feed.xml
  - `src\agent\ui.js`: https://www.bing.com/search?q=
  - `src\legacy-app.js`: https://api.open-meteo.com/v1/forecast?latitude=
  - `src\retrieval\providers\github.js`: https://api.github.com/search/repositories?q=
  - `src\retrieval\providers\open-meteo.js`: https://geocoding-api.open-meteo.com/v1/search?count=1&language=zh&format=json&name=, https://api.open-meteo.com/v1/forecast?latitude=, https://open-meteo.com/
  - `src\retrieval\providers\stackexchange.js`: https://api.stackexchange.com/2.3/search/advanced?site=stackoverflow&order=desc&sort=relevance&pagesize=5&filter=withbody&q=
  - `src\retrieval\providers\wikidata.js`: https://www.wikidata.org/w/api.php?action=wbsearchentities&search=, https://www.wikidata.org/wiki/
  - `src\retrieval\providers\wikipedia.js`: https://zh.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=, https://zh.wikipedia.org/?curid=
  - `src\retrieval\search-fallback.js`: https://www.bing.com/search?q=, https://www.baidu.com/s?wd=, https://www.google.com/search?q=
  - `src\watch\watch-center.js`: https://example.com/feed.xml

## 13. 工程化状态

- package.json存在: 否
- Playwright: 未安装
- Vitest: 未安装
- ESLint: 未安装
- npm scripts: (none)

## 14. CI状态

- GitHub Actions目录存在: 否
- Workflows: (none)

---

## 审计结论

v2.0.0-rc1 基线已建立在 v1.5.0 最终 commit (`4d58580`) 之上。

需要完成:
1. 工程化基础 (package.json + 测试工具)
2. 单元测试覆盖核心模块
3. Playwright E2E
4. 可访问性/安全/性能审计
5. CI配置
6. 部署闭环

Parser hash 已记录，本阶段不得修改。
