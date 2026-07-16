# Known Risks

1. Human-reviewed Chinese evidence is absent, so production-language accuracy and investment-grade language claims are unproven.
2. IndexedDB point reads show large p95/p99 contention spikes immediately after a 10k-record startup.
3. Cross-store consistency is journal/replay based, not a single native ACID transaction.
4. Legacy Record mutations that bypass Chronos hooks can create stale semantic sidecars; audit repairs missing/dangling state but cannot infer every semantic edit.
5. Recovery payload staging can be absent if a process dies between journal prepare and staging. That operation is safely quarantined, but requires user inspection.
6. Conflict coverage is 10/14; timezone, all-day, anniversary-load, and duplicate-person follow-up remain pending.
7. Remote CI results for the new stacked branch are not known until the branch is pushed and Actions completes.
