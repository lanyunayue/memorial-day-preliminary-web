# Shike v1.2.0 Migration Plan

## Startup Sequence

1. Read existing `shike_records_v1` without deleting it.
2. Open IndexedDB `shike_local_db` version 2.
3. Check marker `localstorage_to_indexeddb_v2`.
4. If absent, create localStorage snapshot `shike_pre_migration_snapshot_v2` containing the untouched source JSON.
5. Normalize valid records, repair duplicate/missing IDs, and classify invalid records.
6. In one transaction, replace `records`, append quarantine items, write the migration marker, and write an audit entry.
7. Read records and quarantine count back from IndexedDB.
8. Mirror verified records to localStorage as the synchronous cache.
9. Start the existing UI with the IndexedDB result.

## Failure Rules

- Snapshot failure prevents migration.
- Open, transaction, or verification failure switches to `legacy-fallback` and starts from old localStorage records.
- No migration path clears localStorage.
- A completed marker and records are committed atomically, so an interrupted migration cannot leave a marker without its record transaction.
- Later writes update localStorage synchronously and persist an atomic IndexedDB replacement asynchronously.

## Import Rules

- Old array and legacy object backups remain accepted.
- v2 backups verify checksum when present.
- Files above 5 MB are rejected before reading.
- Import remains preview-first and requires user confirmation.
- Invalid imported records are retained in quarantine after confirmation; cancellation writes nothing.
