# Domain Model

The temporal draft schema supports commitment, waiting_for, task, goal, event, anniversary, habit, note, and thought. A confirmed draft produces the legacy Record as the durable user-facing object plus optional sidecars.

| Object | Ownership | Durable store | Key invariant |
| --- | --- | --- | --- |
| Record | Existing Shike | `records` | Unique stable ID |
| Temporal Draft | Chronos | `temporal_drafts` | Validated schema and source span |
| Node / Edge | Chronos | `temporal_nodes`, `temporal_edges` | Every record-scoped relation cites a Record ID |
| Waiting For | Chronos | `temporal_waiting` | References an existing Record |
| Correction | Chronos | `temporal_corrections` | Local provenance, secret redaction |
| Adaptation Rule | Chronos | `temporal_adaptation_rules` | Source corrections, reversible state |
| Operation | Chronos | `temporal_operations` | Checksum, steps, terminal status |

Record schema remained unchanged. IndexedDB schema version moved to 4 only to add Chronos stores.
