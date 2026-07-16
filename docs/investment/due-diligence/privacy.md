# Privacy

Records, graph, waiting state, corrections, adaptation rules, journals, locks, and recovery staging remain in local browser storage. No telemetry or remote embedding service was added.

Journal entries contain checksums and identifiers rather than payload bodies. Temporary replay payloads remain local and are deleted after commit. Backup export explicitly includes adaptation rules so the user can inspect and move them; old backups without rules remain compatible and do not silently erase current rules.

Human corpus collection must not commit private conversations, account IDs, reviewer real names, or unconsented production data.
