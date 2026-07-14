# Architecture

```mermaid
flowchart LR
  UI["Existing Shike Web UI"] --> TI["Temporal Intelligence"]
  TI --> D["Temporal Draft validator"]
  D --> OC["Operation Coordinator"]
  OC --> J["Operation Journal"]
  OC --> R["Record repository"]
  OC --> G["Graph repository"]
  OC --> W["Waiting For repository"]
  OC --> C["Correction store"]
  C --> A["Reversible adaptation rules"]
  R --> M["Cited Temporal Memory"]
  G --> M
  W --> M
  J --> RR["Startup recovery"]
  RR --> OC
  R --> CA["Consistency auditor"]
  G --> CA
  W --> CA
```

All durable stores are local IndexedDB. BroadcastChannel carries invalidation hints; correctness depends on IndexedDB locks, optimistic resource versions, operation IDs, and journal replay.
