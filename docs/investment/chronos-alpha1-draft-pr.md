DEPENDS ON PR #3

## Summary

PROJECT CHRONOS v2.2.0-alpha1 introduces the first working Web vertical for Shike's local-first Personal Temporal Operating System. It turns a natural Chinese paragraph into independently reviewable temporal drafts, persists confirmed Records and sidecars, builds traceable relationships, and produces explainable local actions and reviews.

This is a stacked Draft PR. Its base must remain `program-v210a2-investment-hardening` until PR #3 is reviewed and merged.

## Product Capabilities

- Versioned Temporal Domain and validation contracts.
- Multi-intent Life Inbox with source spans, confidence bands, missing fields, edit, cancel, individual confirm, and confirm-all.
- IndexedDB Commitment Graph with source Record traceability, audit, rebuild, backup, tombstone, restore, and purge.
- Waiting For lifecycle with expected-today, overdue, resolved, and cancelled states.
- Explainable local Next Best Action with user-controlled complete, later, ignore, and never-suggest actions.
- Local Daily Brief, Weekly Review, correction history, and source-backed Temporal Memory.
- Trash, snapshot, and backup sidecar integration.
- Mandatory real-browser runtime, Chronos vertical, responsive, and offline evidence.

## Data and Safety Boundaries

- Existing Record schema is unchanged.
- Locked parser source and hash are unchanged.
- Temporal data remains local; no remote model or analytics service is introduced.
- Drafts never silently create Records.
- Failed cross-repository confirmation rolls back the partial Record in this alpha.
- `APP_VERSION`, `APP_UPDATED_AT`, and `CACHE_NAME` are unchanged.
- No main merge or production deployment is included.

## Verification

- Unit: 17/17.
- Legacy suites: 66/66.
- Parser/agent regression: 102/102.
- Temporal review and memory: 24/24.
- Temporal corpus: 706/706 over 700 unique generated fixtures.
- Temporal property tests: 1200/1200.
- Edge 150 runtime: 11/11.
- Chronos browser vertical: 21/21.
- Offline startup: 3/3.
- Accessibility: 6/6.
- CI gate regression: 4/4.
- Test integrity: 684/684, skipped=0.
- Browser console errors: 0.
- Browser network errors: 0.

## Known Gaps

- Conflict detection covers 3 of 14 declared classes.
- Correction events are stored but do not yet adapt local rules.
- Temporal Memory is structured retrieval, not full semantic retrieval.
- The 700 generated fixtures have not received independent human linguistic review.
- Cross-repository operation journaling, fault recovery, multi-tab concurrency, and IndexedDB stress evidence are deferred to alpha2.
- Desktop, browser extension, HarmonyOS, cloud sync, payments, and commercial metrics are not implemented or claimed.

## Evidence

See `docs/investment/investment-readiness-report.md`.
