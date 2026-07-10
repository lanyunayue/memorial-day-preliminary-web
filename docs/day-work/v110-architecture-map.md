# Shike v1.1.0 Architecture Map

## Runtime Layers

| Layer | Responsibility | Input | Output | Depends on |
| --- | --- | --- | --- | --- |
| `index.html` | Semantic page structure and resource entry points | Browser navigation | DOM shell | CSS and script URLs only |
| `assets/styles/app.css` | Existing visual system and responsive rules | DOM classes and theme attributes | Rendered layout | No JavaScript |
| `src/config/*` | Version and stable storage constants | Release metadata | Browser globals used by compatibility runtime | Nothing |
| `src/utilities/sanitize.js`, `ids.js` | Safe text escaping and record IDs | Raw text / current time | Escaped text / unique ID | Nothing |
| `src/storage/legacy-storage.js` | Defensive localStorage access | Stable keys and JSON values | Read/write status | Browser localStorage |
| `src/legacy-app.js` | Compatibility runtime for all verified v1.0 behavior | DOM, config, adapters | Existing product behavior | Config and classic adapters |
| `src/app.js` | ES module composition root | Modular services | `window.ShikeModules` registry | Core, storage, records, parser, calendar, views, components, utilities |
| `src/core/*` | Events, state, routing, normalized errors | Plain data | Framework-independent primitives | Nothing |
| `src/storage/*` | Repository, migration registry, backup metadata | Storage adapter and payloads | Storage contracts | Legacy storage adapter only |
| `src/records/*` | Record normalization, dedupe, recurrence, service | Record values | Normalized records and operations | Repository and record normalizer |
| `src/parser/parser-adapter.js` | Stable bridge to verified parser | User sentence | Existing parser output | Compatibility parser global |
| `src/calendar/*` | Date filtering and `.ics` bridge | Records/date | Calendar results | Compatibility `.ics` global where required |
| `src/views/*`, `src/components/*` | View registry and compatibility component facade | View/component requests | Existing UI calls | Compatibility globals |

## Prohibited Dependencies

- Core modules must not import views, components, storage, or browser compatibility code.
- Storage modules must not import views or components.
- Record modules must not import views or components.
- Parser and calendar adapters must not mutate storage directly.
- View/component modules must not define record schema or migration rules.
- `src/legacy-app.js` is never imported by ES modules; it remains a one-way compatibility boundary.

## Compatibility Guarantees

- Record key remains `shike_records_v1`.
- Settings key remains `shike_settings_v1`.
- Backup schema remains version 2.
- The `parseReminderText` source range is byte-equivalent after line-ending normalization to v1.0.0.
- Existing browser globals remain available for current UI and acceptance tests.
