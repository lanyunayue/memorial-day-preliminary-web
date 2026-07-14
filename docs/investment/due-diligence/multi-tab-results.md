# Multi-Tab Results

Contract tests: `7/7`. Real Edge CDP: `10/10`.

Two tabs share one IndexedDB origin. Simultaneous confirmation creates one Record and one committed journal. Resource locking produces one winner, stale optimistic versions return `TEMPORAL_VERSION_CONFLICT` with a user-facing message, duplicate operation IDs are idempotent, and expired locks are recoverable after a tab crash.

BroadcastChannel is an invalidation signal only. IndexedDB transaction state is the source of truth.
