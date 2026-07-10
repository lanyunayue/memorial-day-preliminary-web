# Shike v1.2.0 Disaster Recovery

## Recovery Sources

1. IndexedDB `records` is the primary source after successful migration.
2. `shike_records_v1` remains a synchronous mirror and fallback.
3. `shike_pre_migration_snapshot_v2` preserves the original pre-migration JSON.
4. `shike_records_last_good_v1` remains the prior last-good application snapshot.
5. User JSON backups remain portable recovery files.
6. `quarantined_records` retains invalid source values and can be exported from My > Data safety.

## Automatic Recovery

- IndexedDB open/transaction failure does not block startup; the bridge reports `legacy-fallback`.
- Invalid records do not enter the primary record store.
- Failed imports do not replace existing records.
- IndexedDB record replacement uses a transaction so a failed clear/put sequence is aborted as one unit.

## Manual Rollback

Code rollback target: `shike-web-stable-before-v120-local-first-data`.

Because v1.2.0 does not delete old localStorage, rolling application code back to v1.1.0 can still read the mirrored `shike_records_v1`. Do not manually delete `shike_local_db`, migration snapshots, or quarantine data during rollback.
