# Shike v1.1.0 Module Dependency Graph

```mermaid
flowchart TD
  HTML[index.html] --> CSS[assets/styles/app.css]
  HTML --> CONFIG[src/config]
  HTML --> ADAPTERS[classic adapters]
  HTML --> LEGACY[src/legacy-app.js]
  HTML --> APP[src/app.js]
  CONFIG --> LEGACY
  ADAPTERS --> LEGACY
  APP --> CORE[src/core]
  APP --> STORAGE[src/storage]
  APP --> RECORDS[src/records]
  APP --> PARSER[src/parser]
  APP --> CALENDAR[src/calendar]
  APP --> VIEWS[src/views]
  APP --> COMPONENTS[src/components]
  APP --> UTIL[src/utilities]
  RECORDS --> STORAGE
  PARSER -. compatibility call .-> LEGACY
  CALENDAR -. compatibility call .-> LEGACY
  COMPONENTS -. compatibility call .-> LEGACY
```

All ES imports originate at `src/app.js` and resolve to local relative paths. The graph test found no unresolved imports and no cycles. Compatibility calls are runtime bridges, not ES imports, so legacy code cannot import back into the module graph.
