# Fault Recovery Results

Local result on 2026-07-13: `43/43` assertions passed.

Covered interruptions include Record success with Graph failure, Graph success with Waiting failure, delete/tombstone split, restore/Graph split, snapshot/sidecar split, close after prepared, close after sidecars, duplicate replay, and checksum mismatch quarantine.

The five-intent disaster loop fails on the third sidecar write, preserves three unique Records, restarts, replays the parent/child operation without duplication, confirms all five drafts, restores Graph and Waiting For, and performs no extra change on the next restart.

This is deterministic fault injection plus real-browser vertical coverage. Browser process termination at every individual IndexedDB callback is not exhaustively enumerated.
