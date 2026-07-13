# Sidecar Integrity

Ten operation classes are journaled: create, update, complete, delete, restore, purge, graph rebuild, backup import, snapshot restore, and Life Inbox batch confirmation. `scripts/test-chronos-operation-coverage.js` verifies all ten reach a terminal status, journal entries omit payload bodies, staged replay data is removed, and the final graph audit is valid.

The consistency auditor detects missing Records, missing Graph relations, missing Waiting For items, dangling Graph/Waiting references, and incomplete operations. Safe rebuild removes dangling sidecars and reconstructs recoverable sidecars from the confirmed draft and operation provenance.

No cross-store ACID claim is made. Consistency is achieved by idempotent steps, durable journal state, replay, quarantine, and audit.
