# Operation Journal Protocol

Statuses: `prepared`, `record_written`, `sidecars_written`, `committed`, `compensating`, `recovered`, `quarantined`.

Each entry contains operation/type/resource IDs, timestamps, completed and pending steps, SHA-256 payload checksum, retry count, sanitized last error, and schema version. It does not contain the full payload. A repeated operation with a different checksum is quarantined.

Recovery scans nonterminal entries in start order. Completed steps are skipped. Three failed retries cause quarantine. Parent batch recovery may complete a child operation; a later scan classifies that child as deduplicated, not as an additional recovery.
