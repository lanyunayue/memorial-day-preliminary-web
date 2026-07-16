# Data Flow

```mermaid
sequenceDiagram
  participant U as User
  participant I as Life Inbox
  participant J as Operation Journal
  participant R as Record Store
  participant S as Sidecar Stores
  participant V as Validator/Auditor
  U->>I: confirm draft
  I->>J: prepare(checksum, pending steps)
  J-->>I: prepared
  I->>R: idempotent Record write
  I->>J: mark record_written
  I->>S: Graph / Waiting / Correction write
  I->>J: mark sidecars_written
  I->>V: validate and audit
  I->>J: commit
  Note over J,V: Restart scans nonterminal operations and replays only missing steps
```

Full operation payloads are not stored in the journal. Operations that require replay parameters use an independent local staging item keyed by operation ID; it is deleted after commit. A crash before staging leaves a no-op operation that is quarantined rather than guessed.
