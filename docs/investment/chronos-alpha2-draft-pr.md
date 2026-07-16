DEPENDS ON program-v220a1-temporal-os

# PROJECT CHRONOS v2.2.0-alpha2

TEMPORAL INTEGRITY & HUMAN LANGUAGE HARDENING

## Scope

This stacked alpha hardens the existing Web Temporal OS core. It does not add desktop, extension, HarmonyOS, cloud, account, payment, remote-model, or UI-redesign scope. It does not change `APP_VERSION`, `APP_UPDATED_AT`, `CACHE_NAME`, the parser implementation, or the Record schema.

## Changes

- Adds a checksum-only Temporal Operation Journal, retry/quarantine recovery, consistency audit, and safe rebuild.
- Journals create, update, complete, delete, restore, purge, graph rebuild, backup import, snapshot restore, and batch confirmation.
- Adds IndexedDB locks, optimistic resource versions, operation-ID dedupe, BroadcastChannel invalidation, and real two-tab CDP coverage.
- Adds reversible local adaptation rules with provenance, disable/delete/reset/export, backup compatibility, A/B evaluation, and automatic disable on net regression.
- Expands conflict coverage from 3 to 10 required classes using real domain objects.
- Replaces basic memory matching with weighted local token/person/topic/commitment/Waiting retrieval, temporal decay, completion filtering, citations, and uncertainty.
- Adds canonical cross-platform parser hash enforcement.
- Adds real IndexedDB quota/stress evidence and a one-command due-diligence verifier.
- Classifies the existing 700 fixtures honestly as generated/adversarial and adds a frozen blind-set protocol without fabricating human review.

## Verification

`npm run chronos:verify` completed locally with classification:

`PASS_HUMAN_CORPUS_NOT_AVAILABLE`

- Domain: 11/11
- Generated corpus: 706/706 over 700 unique fixtures
- Property: 1200/1200
- Fault recovery: 43/43
- Graph: 18/18
- Operation coverage: 9/9, all 10 operation types
- Migration: 14/14
- Multi-tab contract: 7/7
- Conflict: 17/17, 10/14 classes
- Cited memory: 16/16
- Reversible adaptation: 20/20
- Corpus provenance: 16/16
- Canonical parser hash: 6/6
- Test integrity: 690/690
- Runtime CDP: 11/11
- Chronos vertical CDP: 21/21
- Multi-tab CDP: 10/10
- Offline CDP: 3/3
- Browser runner: 4 passed, 0 failed
- IndexedDB stress runner: 1 passed, 0 failed
- Console errors: 0
- Network errors: 0

Stress restoration retained 10,000 Records, 50,000 nodes, 100,000 edges, 10,000 corrections, and 5,000 journal entries. Machine-readable results are under `artifacts/chronos-alpha2/`.

## Explicit Evidence Gap

Human-reviewed Chinese fixtures: **0**. Human precision, recall, F1, confusion matrix, negation false-positive rate, completed-fact false-positive rate, goal-to-task error, Waiting For precision, multi-intent exact match, and missing-field honesty are **NOT AVAILABLE**. The generated corpus pass rate must not be presented as production-language accuracy.

## Known Risks

- IndexedDB point-read tail latency shows p95/p99 spikes after 10k-record startup.
- Cross-store consistency is journal/replay based rather than one native ACID transaction.
- Legacy mutation paths that bypass Chronos hooks can leave semantically stale sidecars.
- Conflict coverage remains 10/14.
- Stacked-branch GitHub Actions evidence is pending until this branch is pushed.

## Review Order

1. Operation protocol and startup recovery.
2. Fault matrix and ten-operation coverage.
3. Multi-tab locking and real browser evidence.
4. Stress JSON and latency tails.
5. Adaptation safety and backup compatibility.
6. Human-corpus methodology and explicit missing evidence.

Keep this pull request in Draft. Base: `program-v220a1-temporal-os`. Head: `program-v220a2-temporal-integrity`.
