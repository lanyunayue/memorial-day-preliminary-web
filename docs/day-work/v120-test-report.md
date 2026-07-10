# Shike v1.2.0 Test Report

## Data Tests

- Repository structure/transactions: `12/12`.
- Legacy migration, marker, snapshot, ID repair, and fallback: `14/14`.
- Record normalization/fingerprint/checksum: `16/16`.
- Corruption quarantine and non-deletion: `10/10`.
- Backup v2 metadata/checksum/legacy support/file limit: `13/13`.

## Regression And Browser

- Full Node regression suite: `48/48` scripts passed.
- Isolated Edge with two preloaded localStorage records: `10/10` migration/runtime checks passed.
- Standard Edge runtime: `11/11` passed.
- Edge service-worker offline restart: `3/3` passed.

The browser migration test verified migration marker, retained snapshot, UI/DB count parity, later save persistence, local cache mirroring, invalid record exclusion, and quarantine count.
